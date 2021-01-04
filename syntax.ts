import { nextTokenIs, Scanner, Token, TokenError } from "./deps.ts";
import { ParseNode } from "./parsenode.ts";
import { Visitor } from "./visitor.ts";

/**
 * Represents a Syntax definition.
 *
 * The syntax statement is used to define the protobuf version.
 *
 * https://developers.google.com/protocol-buffers/docs/reference/proto3-spec#syntax
 */
export class Syntax extends ParseNode {
  constructor(
    /**
     * The version the syntax statement declared. This is normalised to just
     * the number part, so `"syntax3"` becomes just `3`.
     */
    public version: 2 | 3 = 3,
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
    return `syntax = "proto${this.version}";`;
  }

  toJSON() {
    return {
      type: "Syntax",
      start: this.start,
      end: this.end,
      version: this.version,
    };
  }

  accept(visitor: Visitor) {
    visitor.visit?.(this);
    visitor.visitSyntax?.(this);
  }

  static async parse(scanner: Scanner): Promise<Syntax> {
    if (scanner.contents !== "syntax") {
      await nextTokenIs(scanner, Token.keyword, "syntax");
    }
    const start = scanner.startPos;
    await nextTokenIs(scanner, Token.token, "=");
    const version = (await nextTokenIs(scanner, Token.string)).slice(6, -1);
    if (version === "3" || version === "2") {
      await nextTokenIs(scanner, Token.token, ";");
      return new Syntax(Number(version) as 3 | 2, start, scanner.endPos);
    }
    throw new TokenError(
      scanner,
      Token.string,
      Token.string,
      "'proto2' or 'proto3'",
    );
  }
}
