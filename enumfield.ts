import { ParseNode } from "./parsenode.ts";
import { Visitor } from "./visitor.ts";
import { nextTokenIs, Scanner, Token } from "./deps.ts";

/**
 * Represents an EnumField - the keys/values that an Enum is composed of.
 *
 * https://developers.google.com/protocol-buffers/docs/reference/proto3-spec#enum_definition
 */
export class EnumField extends ParseNode {
  constructor(
    /**
     * The name of the EnumField.
     */
    public name: string,
    /**
     * The id of the EnumField.
     */
    public id: number,
    /**
     * The starting [line, column]
     */
    public start: [number, number] = [0, 0],
    /**
     * The ending [line, column]
     */
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
