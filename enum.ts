import { ParseNode, Visitor } from "./parsenode.ts";
import { Scanner, Token, nextTokenIs, TokenError } from "./deps.ts";
import { EnumField } from "./nodes.ts";
import { expectSimpleIdent } from "./util.ts";
import { Option } from "./option.ts";

type EnumStatement =
  | EnumField
  | Option;

export class Enum extends ParseNode {
  constructor(
    public name: string,
    public body: EnumStatement[] = [],
    public start: [number, number] = [0, 0],
    public end: [number, number] = [0, 0],
  ) {
    super();
  }

  toProto() {
    let body = "";
    if (this.body.length) {
      body = `\n  ${this.body.map((node) => node.toProto()).join("\n  ")}\n`;
    }
    return `enum ${this.name} {${body}}`;
  }

  toJSON() {
    return {
      type: "Enum",
      start: this.start,
      end: this.end,
      name: this.name,
      body: this.body.map((node) => node.toJSON()),
    };
  }

  accept(visitor: Visitor) {
    visitor.visit?.(this);
    visitor.visitEnum?.(this);
    for (const node of this.body) node.accept(visitor);
  }

  static async parse(scanner: Scanner): Promise<Enum> {
    if (scanner.contents !== "enum") {
      await nextTokenIs(scanner, Token.keyword, "enum");
    }
    const start = scanner.startPos;
    const name = await expectSimpleIdent(scanner);
    await nextTokenIs(scanner, Token.token, "{");
    const body: EnumStatement[] = [];
    for await (const token of scanner) {
      const str = scanner.contents;
      if (token === Token.token && str === "}") {
        return new Enum(name, body, start, scanner.endPos);
      } else if (token === Token.keyword && scanner.contents === "option") {
        body.push(await Option.parse(scanner));
      } else if (token === Token.identifier) {
        body.push(await EnumField.parse(scanner));
      }
    }
    throw new TokenError(scanner, Token.eof);
  }
}
