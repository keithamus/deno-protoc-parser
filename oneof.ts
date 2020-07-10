import { ParseNode, Visitor } from "./parsenode.ts";
import { Scanner, Token, nextTokenIs, TokenError } from "./deps.ts";
import { expectSimpleIdent } from "./util.ts";
import { Field } from "./field.ts";
import { Group } from "./group.ts";

type OneofStatement =
  | Field
  | Group;

export class Oneof extends ParseNode {
  constructor(
    public name: string,
    public body: OneofStatement[],
    public start: [number, number] = [0, 0],
    public end: [number, number] = [0, 0],
  ) {
    super();
  }

  toProto(syntax: 2 | 3 = 3) {
    let body = "";
    if (this.body.length) {
      body = `\n  ${
        this.body.map((node) => node.toProto(syntax)).join("\n  ")
      }\n`;
    }
    return `oneof ${this.name} {${body}}`;
  }

  toJSON() {
    return {
      type: "Oneof",
      start: this.start,
      end: this.end,
      name: this.name,
      body: this.body.map((node) => node.toJSON()),
    };
  }

  accept(visitor: Visitor) {
    visitor.visit?.(this);
    visitor.visitOneof?.(this);
    for (const node of this.body) node.accept(visitor);
  }

  static async parse(scanner: Scanner, syntax: 2 | 3 = 3): Promise<Oneof> {
    if (scanner.contents !== "oneof") {
      await nextTokenIs(scanner, Token.identifier, "oneof");
    }
    const start = scanner.startPos;
    const name = await expectSimpleIdent(scanner);
    const body: OneofStatement[] = [];
    await nextTokenIs(scanner, Token.token, "{");
    for await (const token of scanner) {
      if (token === Token.token && scanner.contents === "}") {
        return new Oneof(name, body, start, scanner.endPos);
      }
      if (token === Token.identifier && scanner.contents === "group") {
        body.push(await Group.parse(scanner, syntax));
      } else {
        body.push(await Field.parse(scanner, syntax));
      }
    }
    throw new TokenError(scanner, Token.eof);
  }
}
