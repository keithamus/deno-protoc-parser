import { ParseNode, ParseNodeJSON } from "./parsenode.ts";
import { Visitor } from "./visitor.ts";
import { Scanner, Token, nextTokenIs, TokenError } from "./deps.ts";
import { Field } from "./field.ts";
import { Group } from "./group.ts";
import { Enum } from "./enum.ts";
import { Option } from "./option.ts";
import { Extend } from "./extend.ts";
import { Extensions } from "./extensions.ts";
import { Oneof } from "./oneof.ts";
import { MapField } from "./mapfield.ts";
import { Reserved } from "./reserved.ts";
import { Comment } from "./comment.ts";
import { expectFullIdent, assignComments, indent } from "./util.ts";

type MessageStatement =
  | Field
  | Enum
  | Group
  | Message
  | Extend
  | Extensions
  | Option
  | Oneof
  | MapField
  | Reserved;

/**
 * Represents a Message definition.
 *
 * A message consists of a message name and a message body. The message body
 * can have fields, nested enum definitions, nested message definitions,
 * options, oneofs, map fields, and reserved statements.
 *
 * https://developers.google.com/protocol-buffers/docs/reference/proto3-spec#message_definition
 */
export class Message extends ParseNode {
  constructor(
    /**
     * The name of the Message.
     */
    public name: string,
    /**
     * A collection of direct child nodes in the Message.
     */
    public body: MessageStatement[] = [],
    /**
     * The starting [line, column]
     */
    public start: [number, number] = [0, 0],
    /**
     * The ending [line, column]
     */
    public end: [number, number] = [0, 0],
    /**
     * Any comment nodes directly above a message, or inside a message that
     * don't belong to one of the child nodes.
     */
    public comments: Comment[] = [],
  ) {
    super();
    assignComments(this);
  }

  toProto(syntax: 2 | 3 = 3): string {
    let comments = "";
    if (this.comments.length) {
      comments = this.comments.map((node) => node.toProto()).join("\n") + "\n";
    }
    if (!this.body.length) return `${comments}message ${this.name} {}`;
    return `${comments}message ${this.name} {\n${
      this.body.map((node) => indent(node.toProto(syntax))).join("\n")
    }\n}`;
  }

  toJSON(): ParseNodeJSON {
    return Object.assign(
      {
        type: "Message",
        start: this.start,
        end: this.end,
        name: this.name,
        body: this.body.map((node) => node.toJSON()),
      },
      this.comments.length
        ? { comments: this.comments.map((node) => node.toJSON()) }
        : {},
    );
  }

  accept(visitor: Visitor) {
    visitor.visit?.(this);
    visitor.visitMessage?.(this);
    for (const node of this.body) node.accept(visitor);
    for (const node of this.comments) node.accept(visitor);
  }

  static async parse(scanner: Scanner, syntax: 2 | 3 = 3): Promise<Message> {
    if (scanner.contents !== "message") {
      await nextTokenIs(scanner, Token.keyword, "message");
    }
    const start = scanner.startPos;
    const name = await expectFullIdent(scanner);
    const body: MessageStatement[] = [];
    let comments: Comment[] = [];
    await nextTokenIs(scanner, Token.token, "{");
    for await (const token of scanner) {
      const str = scanner.contents;
      if (token === Token.token && str === "}") {
        return new Message(name, body, start, scanner.endPos, comments);
      } else if (token === Token.token && str === ";") {
        // Empty statements are allowed!
      } else if (
        token === Token.identifier && str === "group" && syntax === 2
      ) {
        body.push(await Group.parse(scanner));
      } else if (token === Token.keyword && str === "repeated") {
        const token = await scanner.scan();
        if (
          syntax === 2 && token === Token.identifier &&
          scanner.contents === "group"
        ) {
          const node = await Group.parse(scanner, syntax);
          node.repeated = true;
          body.push(node);
        } else {
          const node = await Field.parse(scanner, syntax);
          node.repeated = true;
          body.push(node);
        }
      } else if (token === Token.keyword && str === "optional") {
        if (syntax === 3) {
          throw new TokenError(
            scanner,
            Token.identifier,
            Token.identifier,
            "Optional fields are not allowed in Proto3",
          );
        }
        const token = await scanner.scan();
        if (token === Token.identifier && scanner.contents === "group") {
          const node = await Group.parse(scanner, syntax);
          node.optional = true;
          body.push(node);
        } else {
          const node = await Field.parse(scanner, syntax);
          node.optional = true;
          body.push(node);
        }
      } else if (token === Token.keyword && str === "required") {
        if (syntax === 3) {
          throw new TokenError(
            scanner,
            Token.identifier,
            Token.identifier,
            "Required fields are not allowed in Proto3",
          );
        }
        const token = await scanner.scan();
        if (token === Token.identifier && scanner.contents === "group") {
          const node = await Group.parse(scanner, syntax);
          node.required = true;
          body.push(node);
        } else {
          const node = await Field.parse(scanner, syntax);
          node.required = true;
          body.push(node);
        }
      } else if (token === Token.identifier && str !== "oneof") {
        body.push(await Field.parse(scanner, syntax));
      } else if (token === Token.keyword && str === "enum") {
        body.push(await Enum.parse(scanner));
      } else if (token === Token.keyword && str === "message") {
        body.push(await Message.parse(scanner, syntax));
      } else if (token === Token.keyword && str === "extend") {
        body.push(await Extend.parse(scanner, syntax));
      } else if (token === Token.keyword && str === "extensions") {
        body.push(await Extensions.parse(scanner, syntax));
      } else if (token === Token.keyword && str === "option") {
        body.push(await Option.parse(scanner));
      } else if (token === Token.identifier && str === "oneof") {
        body.push(await Oneof.parse(scanner, syntax));
      } else if (token === Token.keyword && str === "map") {
        body.push(await MapField.parse(scanner));
      } else if (token === Token.identifier && str === "reserved") {
        body.push(await Reserved.parse(scanner));
      } else if (token === Token.comment) {
        comments.push(await Comment.parse(scanner));
      } else {
        throw new TokenError(scanner, token);
      }
    }
    throw new TokenError(scanner, Token.eof);
  }
}
