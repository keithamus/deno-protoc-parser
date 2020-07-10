import { ParseNode, Visitor } from "./parsenode.ts";
import { Constant } from "./nodes.ts";
import { Scanner, Token, nextTokenIs } from "./deps.ts";
import { expectFullIdent } from "./util.ts";

export class Option extends ParseNode {
  constructor(
    public key: string,
    public value: Constant,
    public start: [number, number] = [0, 0],
    public end: [number, number] = [0, 0],
  ) {
    super();
  }

  toProto() {
    return `option ${this.key} = ${this.value.toProto()};`;
  }

  toJSON() {
    return {
      type: "Option",
      start: this.start,
      end: this.end,
      key: this.key,
      value: this.value.toJSON(),
    };
  }

  accept(visitor: Visitor) {
    visitor.visit?.(this);
    visitor.visitOption?.(this);
    this.value.accept(visitor);
  }

  static async parse(scanner: Scanner): Promise<Option> {
    if (scanner.contents !== "option") {
      await nextTokenIs(scanner, Token.keyword, "option");
    }
    const start = scanner.startPos;
    const key = await expectFullIdent(scanner);
    await nextTokenIs(scanner, Token.token, "=");
    const value = await Constant.parse(scanner);
    await nextTokenIs(scanner, Token.token, ";");
    return new Option(key, value, start, scanner.endPos);
  }
}
