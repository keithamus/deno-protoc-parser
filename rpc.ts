import { ParseNode, Visitor } from "./parsenode.ts";
import { Scanner, Token, nextTokenIs, TokenError } from "./deps.ts";
import { expectSimpleIdent, assignComments } from "./util.ts";
import { Option, Comment } from "./nodes.ts";

export class RPC extends ParseNode {
  constructor(
    public name: string,
    public request: { name: string; streaming?: boolean },
    public response: { name: string; streaming?: boolean },
    public body: Option[] | null = [],
    public start: [number, number] = [0, 0],
    public end: [number, number] = [0, 0],
    public comments: Comment[] = [],
  ) {
    super();
    this.request.streaming = this.request.streaming || false;
    this.response.streaming = this.response.streaming || false;
    assignComments(this);
  }

  toProto() {
    let comments = "";
    if (this.comments.length) {
      comments = this.comments.map((node) => node.toProto()).join("\n") + "\n";
    }
    let body = this.body ? " {}" : ";";
    if (this.body && this.body.length) {
      body = ` { \n  ${
        this.body.map((node) => node.toProto()).join("\n  ")
      }\n}`;
    }
    const request = this.request.streaming
      ? `stream ${this.request.name}`
      : this.request.name;
    const response = this.response.streaming
      ? `stream ${this.response.name}`
      : this.response.name;
    return `${comments}rpc ${this.name} (${request}) returns (${response})${body}`;
  }

  toJSON() {
    return Object.assign(
      {
        type: "RPC",
        start: this.start,
        end: this.end,
        name: this.name,
        request: this.request,
        response: this.response,
        body: this.body?.map((node) => node.toJSON()) || null,
      },
      this.comments.length
        ? { comments: this.comments.map((node) => node.toJSON()) }
        : {},
    );
  }

  accept(visitor: Visitor) {
    visitor.visit?.(this);
    visitor.visitRPC?.(this);
    for (const node of this.body || []) node.accept(visitor);
    for (const node of this.comments) node.accept(visitor);
  }

  static async parse(scanner: Scanner): Promise<RPC> {
    if (scanner.contents !== "rpc") {
      await nextTokenIs(scanner, Token.keyword, "rpc");
    }
    const start = scanner.startPos;
    const name = await expectSimpleIdent(scanner);
    await nextTokenIs(scanner, Token.token, "(");
    const request = {
      name: await nextTokenIs(scanner, Token.identifier),
      streaming: false,
    };
    if (request.name === "stream") {
      request.streaming = true;
      request.name = await nextTokenIs(scanner, Token.identifier);
    }
    await nextTokenIs(scanner, Token.token, ")");
    await nextTokenIs(scanner, Token.keyword, "returns");
    await nextTokenIs(scanner, Token.token, "(");
    const response = {
      name: await nextTokenIs(scanner, Token.identifier),
      streaming: false,
    };
    if (response.name === "stream") {
      response.streaming = true;
      response.name = await nextTokenIs(scanner, Token.identifier);
    }
    await nextTokenIs(scanner, Token.token, ")");

    const token = await nextTokenIs(scanner, Token.token);
    if (token === ";") {
      return new RPC(name, request, response, null, start, scanner.endPos);
    } else if (token === "{") {
      const body: Option[] = [];
      for await (const token of scanner) {
        const str = scanner.contents;
        if (token === Token.token && str === "}") {
          return new RPC(name, request, response, body, start, scanner.endPos);
        } else if (token === Token.keyword && scanner.contents === "option") {
          body.push(await Option.parse(scanner));
        }
      }
      throw new TokenError(scanner, Token.eof);
    }
    throw new TokenError(scanner, Token.token, Token.token, "; or {");
  }
}
