import { ParseNode } from "./parsenode.ts";
import { Visitor } from "./visitor.ts";
import { Constant } from "./constant.ts";
import { Scanner, Token, nextTokenIs, TokenError } from "./deps.ts";
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
    public key: string[],
    /**
     * If the key is an extension (wrapped in parens)
     */
    public isExtension: boolean,
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
    let key = this.key.join(".");
    if (this.isExtension) {
      key = `(${this.key[0]})`;
      if (this.key.length > 1) key += `.${this.key.slice(1).join(".")}`;
    } else {
      key = this.key.join(".");
    }
    return `option ${key} = ${this.value.toProto()};`;
  }

  toJSON() {
    return {
      type: "Option",
      start: this.start,
      isExtension: this.isExtension,
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
    let token = await scanner.scan();
    let contents = scanner.contents;
    const key = [];
    let isExtension = false;
    if (token === Token.token && contents === "(") {
      isExtension = true;
      key.push(await expectFullIdent(scanner));
      await nextTokenIs(scanner, Token.token, ")");
      await nextTokenIs(scanner, Token.token);
      contents = scanner.contents;
      if (contents === ".") {
        key.push(await expectFullIdent(scanner));
        await nextTokenIs(scanner, Token.token, "=");
      } else if (contents !== "=") {
        throw new TokenError(scanner, token, Token.token);
      }
    } else if (token === Token.identifier) {
      key.push(await expectFullIdent(scanner, false));
      await nextTokenIs(scanner, Token.token, "=");
    } else {
      throw new TokenError(scanner, token, Token.identifier);
    }
    const value = await Constant.parse(scanner);
    await nextTokenIs(scanner, Token.token, ";");
    return new Option(key, isExtension, value, start, scanner.endPos);
  }
}
