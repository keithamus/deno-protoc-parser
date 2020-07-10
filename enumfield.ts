import { ParseNode, Visitor } from "./parsenode.ts";
import { Scanner, Token, nextTokenIs } from "./deps.ts";

export class EnumField extends ParseNode {
  constructor(
    public name: string,
    public id: number,
    public start: [number, number] = [0, 0],
    public end: [number, number] = [0, 0],
  ) {
    super();
  }

  toProto() {
    return `${this.name} = ${this.id};`;
  }

  toJSON() {
    return {
      type: "EnumField",
      start: this.start,
      end: this.end,
      name: this.name,
      id: this.id,
    };
  }

  accept(visitor: Visitor) {
    visitor.visit?.(this);
    visitor.visitEnumField?.(this);
  }

  static async parse(scanner: Scanner): Promise<EnumField> {
    const start = scanner.startPos;
    const name = scanner.contents;
    await nextTokenIs(scanner, Token.token, "=");
    const id = Number(await nextTokenIs(scanner, Token.int));
    await nextTokenIs(scanner, Token.token, ";");
    return new EnumField(name, id, start, scanner.endPos);
  }
}
