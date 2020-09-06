import { ParseNode } from "./parsenode.ts";
import { Visitor } from "./visitor.ts";
import { Scanner, Token, TokenError } from "./deps.ts";
import { Enum } from "./enum.ts";
import { Extend } from "./extend.ts";
import { Field } from "./field.ts";
import { Import } from "./import.ts";
import { Message } from "./message.ts";
import { Option } from "./option.ts";
import { Package } from "./package.ts";
import { Service } from "./service.ts";
import { Syntax } from "./syntax.ts";
import { Comment } from "./comment.ts";
import { assignComments } from "./util.ts";

type ProtoStatement =
  | Enum
  | Extend
  | Field
  | Import
  | Message
  | Option
  | Package
  | Service
  | Syntax;

/**
 * Represents a Proto node, the root node of any Proto file.
 *
 * https://developers.google.com/protocol-buffers/docs/reference/proto3-spec#proto_file
 */
export class Proto extends ParseNode {
  constructor(
    /**
     * A collection of direct child nodes in the Proto.
     */
    public body: ProtoStatement[],
    /**
     * The starting [line, column]
     */
    public start: [number, number] = [0, 0],
    /**
     * The ending [line, column]
     */
    public end: [number, number] = [0, 0],
    /**
     * Any "top level" comment nodes (comments that don't belong to child nodes).
     */
    public comments: Comment[] = [],
  ) {
    super();
    assignComments(this);
  }

  toProto(syntax: 2 | 3 = 3) {
    return (this.comments as ParseNode[]).concat(this.body as ParseNode[]).map((
      node,
    ) => node.toProto(syntax)).join("\n\n");
  }

  toJSON() {
    return Object.assign(
      {
        type: "Proto",
        start: this.start,
        end: this.end,
        body: this.body.map((node) => node.toJSON()),
      },
      this.comments.length
        ? { comments: this.comments.map((node) => node.toJSON()) }
        : {},
    );
  }

  accept(visitor: Visitor) {
    visitor.visit?.(this);
    visitor.visitProto?.(this);
    for (const node of this.body) node.accept(visitor);
    for (const node of this.comments) node.accept(visitor);
  }

  static async parse(scanner: Scanner, syntax: 2 | 3 = 2): Promise<Proto> {
    let seenSyntax = false;
    const body: ProtoStatement[] = [];
    const comments: Comment[] = [];
    for await (const token of scanner) {
      const str = scanner.contents;
      if (token === Token.eof) {
        return new Proto(body, [1, 1], scanner.endPos, comments);
      } else if (token === Token.token && str === ";") {
        // Empty statements are allowed!
      } else if (token === Token.keyword && str === "syntax" && !seenSyntax) {
        seenSyntax = true;
        const node = await Syntax.parse(scanner);
        syntax = node.version;
        body.push(node);
      } else if (token === Token.keyword && str === "import") {
        body.push(await Import.parse(scanner));
      } else if (token === Token.keyword && str === "package") {
        body.push(await Package.parse(scanner));
      } else if (token === Token.keyword && str === "option") {
        body.push(await Option.parse(scanner));
      } else if (token === Token.keyword && str === "message") {
        body.push(await Message.parse(scanner, syntax));
      } else if (token === Token.keyword && str === "service") {
        body.push(await Service.parse(scanner));
      } else if (token === Token.keyword && str === "enum") {
        body.push(await Enum.parse(scanner));
      } else if (token === Token.keyword && str === "optional") {
        body.push(await Field.parse(scanner, syntax));
      } else if (token === Token.keyword && str === "required") {
        body.push(await Field.parse(scanner, syntax));
      } else if (token === Token.keyword && str === "repeated") {
        body.push(await Field.parse(scanner, syntax));
      } else if (token === Token.keyword && syntax === 2 && str === "extend") {
        body.push(await Extend.parse(scanner, syntax));
      } else if (token === Token.comment) {
        comments.push(await Comment.parse(scanner));
      } else {
        throw new TokenError(scanner, token);
      }
    }
    throw new TokenError(scanner, Token.eof);
  }
}
