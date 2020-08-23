import { Scanner, Token, nextTokenIs, TokenError } from "./deps.ts";
import { ParseNode } from "./parsenode.ts";
import { Visitor } from "./visitor.ts";

/**
 * Represents an Import statement.
 *
 * The import statement is used to import another .proto's definitions.
 *
 * https://developers.google.com/protocol-buffers/docs/reference/proto3-spec#import_statement
 */
export class Import extends ParseNode {
  [b];
  /**
   * If the import was labelled `weak`.
   */
  weak: boolean;
  /**
   * If the import was labelled `public`.
   */
  public: boolean;
  constructor(
    /**
     * The source file the import statement has declared for import.
     */
    public source: string,
    opts: { weak?: boolean; public?: boolean } = {},
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
    this.weak = Boolean(opts.weak);
    this.public = Boolean(opts.public);
  }

  toProto() {
    return `import ${this.weak ? "weak " : ""}${
      this.public ? "public " : ""
    }"${this.source}";`;
  }

  toJSON() {
    return {
      type: "Import",
      start: this.start,
      end: this.end,
      weak: this.weak,
      public: this.public,
      source: this.source,
    };
  }

  accept(visitor: Visitor) {
    visitor.visit?.(this);
    visitor.visitImport?.(this);
  }

  static async parse(scanner: Scanner): Promise<Import> {
    if (scanner.contents !== "import") {
      await nextTokenIs(scanner, Token.keyword, "import");
    }
    const start = scanner.startPos;
    let token = await scanner.scan();
    const opts = { weak: false, public: false };
    let str = scanner.contents;
    let source = "";
    if (token === Token.keyword && (str === "weak" || str === "public")) {
      opts[str as "weak" | "public"] = true;
      token = await scanner.scan();
      str = scanner.contents;
    }
    if (token === Token.string) {
      source = str.slice(1, -1);
    } else {
      throw new TokenError(scanner, token, Token.string);
    }
    await nextTokenIs(scanner, Token.token, ";");
    return new Import(source, opts, start, scanner.endPos);
  }
}
