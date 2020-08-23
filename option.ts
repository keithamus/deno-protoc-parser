import { ParseNode } from "./parsenode.ts";
import { Visitor } from "./visitor.ts";
import { Constant } from "./constant.ts";
import { Scanner, Token, nextTokenIs } from "./deps.ts";
import { expectFullIdent } from "./util.ts";

/**
 * Represents an Option definition, that may be globally scoped, scoped to an
 * Enum, Message, Service, RPC. Fields use a separate `FieldOption` node.
 *
 * Options can be used in proto files, messages, enums and services. An option
 * can be a protobuf defined option or a custom option. For more information,
 * see Options in the language guide.
 *
 * https://developers.google.com/protocol-buffers/docs/reference/proto2-spec#option
 */
export class Option extends ParseNode {
  constructor(
    /**
     * The key of the option.
     */
    public key: string,
    /**
     * The value of the option - as a Constant node.
     */
    public value: Constant,
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
