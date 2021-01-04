import { nextTokenIs, Scanner, Token } from "./deps.ts";
import { ParseNode } from "./parsenode.ts";
import { Visitor } from "./visitor.ts";

/**
 * Represents a Comment, either block or line.
 *
 * https://developers.google.com/protocol-buffers/docs/proto3#adding_comments
 */
export class Comment extends ParseNode {
  constructor(
    /**
     * The raw body of the comment including the comment delimiters (either `/*
     * *\/` or `//`) and any newline characters.
     */
    public body: string,
    public start: [number, number] = [0, 0],
    public end: [number, number] = [0, 0],
  ) {
    super();
    // Remove any indent the comment has
    this.body = this.body.split("\n").map((line, i) =>
      i === 0 ? line : line.slice(this.start[1] - 1)
    ).join("\n");
  }

  toProto() {
    return this.body;
  }

  toJSON() {
    return {
      type: "Comment",
      start: this.start,
      end: this.end,
      body: this.body,
    };
  }

  accept(visitor: Visitor) {
    visitor.visit?.(this);
    visitor.visitComment?.(this);
  }

  static async parse(scanner: Scanner): Promise<Comment> {
    if (!scanner.contents) await nextTokenIs(scanner, Token.comment);
    return new Comment(scanner.contents, scanner.startPos, scanner.endPos);
  }
}
