import { nextTokenIs, Scanner, Token, TokenError } from "./deps.ts";
import { ParseNode } from "./parsenode.ts";
import { Visitor } from "./visitor.ts";
import { Constant } from "./constant.ts";
import { expectFullIdent } from "./util.ts";

/**
 * Represents an inline option defined as part of a "Normal" Field definition.
 *
 * https://developers.google.com/protocol-buffers/docs/reference/proto2-spec#fields
 */
export class FieldOption extends ParseNode {
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
     * The endign [line, column]
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
    return `${key} = ${this.value.toProto()}`;
  }

  toJSON() {
    return {
      type: "FieldOption",
      start: this.start,
      isExtension: this.isExtension,
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
    let contents = scanner.contents;
    let isExtension = false;
    const key = [];
    if (contents === "(") {
      isExtension = true;
      key.push(await expectFullIdent(scanner));
      await nextTokenIs(scanner, Token.token, ")");
      await nextTokenIs(scanner, Token.token);
      contents = scanner.contents;
      if (contents === ".") {
        key.push(await expectFullIdent(scanner));
        await nextTokenIs(scanner, Token.token, "=");
      } else if (contents !== "=") {
        throw new TokenError(scanner, Token.token, Token.token);
      }
    } else {
      key.push(await expectFullIdent(scanner, false));
      await nextTokenIs(scanner, Token.token, "=");
    }
    const value = await Constant.parse(scanner);
    return new FieldOption(key, isExtension, value, start, scanner.endPos);
  }
}
