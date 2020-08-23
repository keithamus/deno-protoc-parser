import { Scanner, Token, nextTokenIs } from "./deps.ts";
import { ParseNode } from "./parsenode.ts";
import { Visitor } from "./visitor.ts";
import { Constant } from "./constant.ts";

export class FieldOption extends ParseNode {
  constructor(
    public key: string,
    public value: Constant,
    public start: [number, number] = [0, 0],
    public end: [number, number] = [0, 0],
  ) {
    super();
  }

  toProto() {
    return `${this.key} = ${this.value.toProto()}`;
  }

  toJSON() {
    return {
      type: "FieldOption",
      start: this.start,
      end: this.end,
      key: this.key,
      value: this.value.toJSON(),
    };
  }

  accept(visitor: Visitor) {
    visitor.visit?.(this);
    visitor.visitFieldOption?.(this);
    this.value.accept(visitor);
  }

  static async parse(scanner: Scanner): Promise<FieldOption> {
    if (scanner.startPos[0] === 0) await scanner.scan();
    const start = scanner.startPos;
    const key = scanner.contents;
    await nextTokenIs(scanner, Token.token, "=");
    const value = await Constant.parse(scanner);
    return new FieldOption(key, value, start, scanner.endPos);
  }
}
