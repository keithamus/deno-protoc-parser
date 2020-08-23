import { Scanner, Token, nextTokenIs, TokenError } from "./deps.ts";
import { ParseNode } from "./parsenode.ts";
import { Visitor } from "./visitor.ts";

export class Import extends ParseNode {
  weak: boolean;
  public: boolean;
  constructor(
    public source: string,
    opts: { weak?: boolean; public?: boolean } = {},
    public start: [number, number] = [0, 0],
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
