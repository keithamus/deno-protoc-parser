import { Scanner, Token, nextTokenIs, TokenError } from "./deps.ts";
import { ParseNode } from "./parsenode.ts";
import { Visitor } from "./visitor.ts";

export class Syntax extends ParseNode {
  constructor(
    public version: 2 | 3 = 3,
    public start: [number, number] = [0, 0],
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
