import { Scanner, Token, nextTokenIs, TokenError } from "./deps.ts";
import { expectSimpleIdent, assignComments, indent } from "./util.ts";
import { Option } from "./option.ts";
import { RPC } from "./rpc.ts";
import { Comment } from "./comment.ts";
import { ParseNode } from "./parsenode.ts";
import { Visitor } from "./visitor.ts";

type ServiceStatement =
  | Option
  | RPC;

export class Service extends ParseNode {
  constructor(
    public name: string,
    public body: ServiceStatement[] = [],
    public start: [number, number] = [0, 0],
    public end: [number, number] = [0, 0],
    public comments: Comment[] = [],
  ) {
    super();
    assignComments(this);
  }

  toProto() {
    let comments = "";
    if (this.comments.length) {
      comments = this.comments.map((node) => node.toProto()).join("\n") + "\n";
    }
    let body = "";
    if (this.body.length) {
      body = `\n${
        this.body.map((node) => indent(node.toProto())).join("\n  ")
      }\n`;
    }
    return `${comments}service ${this.name} {${body}}`;
  }

  toJSON() {
    return Object.assign(
      {
        type: "Service",
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
    visitor.visitService?.(this);
    for (const node of this.body) node.accept(visitor);
    for (const node of this.comments) node.accept(visitor);
  }

  static async parse(scanner: Scanner) {
    if (scanner.contents !== "service") {
      await nextTokenIs(scanner, Token.keyword, "service");
    }
    const start = scanner.startPos;
    const name = await expectSimpleIdent(scanner);
    const body: ServiceStatement[] = [];
    const comments: Comment[] = [];
    await nextTokenIs(scanner, Token.token, "{");
    for await (const token of scanner) {
      const str = scanner.contents;
      if (token === Token.token && str === "}") {
        return new Service(name, body, start, scanner.endPos, comments);
      } else if (token === Token.token && str === ";") {
        // Empty statements are allowed!
      } else if (token === Token.keyword && str === "option") {
        body.push(await Option.parse(scanner));
      } else if (token === Token.keyword && str === "rpc") {
        body.push(await RPC.parse(scanner));
      } else if (token === Token.keyword && str === "stream") {
        body.push(await RPC.parse(scanner));
      } else if (token === Token.comment) {
        comments.push(await Comment.parse(scanner));
      } else {
        throw new TokenError(scanner, token);
      }
    }
    throw new TokenError(scanner, Token.eof);
  }
}
