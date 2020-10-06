import { ParseNode } from "./parsenode.ts";
import { Visitor } from "./visitor.ts";
import { Scanner, Token, nextTokenIs, TokenError } from "./deps.ts";
import { expectSimpleIdent, assignComments } from "./util.ts";
import { Type } from "./type.ts";
import { Option } from "./option.ts";
import { Comment } from "./comment.ts";

/**
 * Represents an RPC method of a Service definition.
 *
 * https://developers.google.com/protocol-buffers/docs/reference/proto3-spec#service_definition
 */
export class RPC extends ParseNode {
  constructor(
    /**
     * The name of the RPC method.
     */
    public name: string,
    /**
     * The identifier of the Request object, and whether or not this is
     * streaming.
     */
    public request: { name: Type; streaming?: boolean },
    /**
     * The identifier of the Resonse object, and whether or not this is
     * streaming.
     */
    public response: { name: Type; streaming?: boolean },
    /**
     * A collection of direct child nodes in the RPC definition.
     */
    public body: Option[] | null = [],
    /**
     * The starting [line, column]
     */
    public start: [number, number] = [0, 0],
    /**
     * The ending [line, column]
     */
    public end: [number, number] = [0, 0],
    /**
     * Any comment nodes directly above a RPC statement, or inside an RPC block
     * that don't belong to one of the child nodes.
     */
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
      ? `stream ${this.request.name.toProto()}`
      : this.request.name.toProto();
    const response = this.response.streaming
      ? `stream ${this.response.name.toProto()}`
      : this.response.name.toProto();
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
    this.request.name.accept(visitor);
    this.response.name.accept(visitor);
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
      name: await Type.parse(scanner),
      streaming: false,
    };
    if (request.name.name === "stream") {
      request.streaming = true;
      request.name = await Type.parse(scanner);
    }
    await nextTokenIs(scanner, Token.token, ")");
    await nextTokenIs(scanner, Token.keyword, "returns");
    await nextTokenIs(scanner, Token.token, "(");
    const response = {
      name: await Type.parse(scanner),
      streaming: false,
    };
    if (response.name.name === "stream") {
      response.streaming = true;
      response.name = await Type.parse(scanner);
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
