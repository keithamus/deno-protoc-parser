import { Scanner, Token, nextTokenIs } from "./deps.ts";
import { ParseNode, Visitor } from "./parsenode.ts";

export class Comment extends ParseNode {
  constructor(
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
