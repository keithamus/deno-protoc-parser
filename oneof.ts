import { ParseNode } from "./parsenode.ts";
import { Visitor } from "./visitor.ts";
import { nextTokenIs, Scanner, Token, TokenError } from "./deps.ts";
import { expectSimpleIdent } from "./util.ts";
import { Field } from "./field.ts";
import { Group } from "./group.ts";

type OneofStatement =
  | Field
  | Group;

/**
 * Represents a Oneof field.
 *
 * Fields are the basic elements of a protocol buffer message. Fields can be
 * normal fields, oneof fields, or map fields. A field has a type and field
 * number.
 *
 * A oneof consists of oneof fields and a oneof name.
 *
 * https://developers.google.com/protocol-buffers/docs/reference/proto3-spec#oneof_and_oneof_field
 */
export class Oneof extends ParseNode {
  constructor(
    /**
     * The name of the Oneof field.
     */
    public name: string,
    /**
     * A collection of direct child nodes in the Oneof field.
     */
    public body: OneofStatement[],
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
  }

  toProto(syntax: 2 | 3 = 3) {
    let body = "";
    if (this.body.length) {
      body = `\n  ${
        this.body.map((node) => node.toProto(syntax)).join("\n  ")
      }\n`;
    }
    return `oneof ${this.name} {${body}}`;
  }

  toJSON() {
    return {
      type: "Oneof",
      start: this.start,
      end: this.end,
      name: this.name,
      body: this.body.map((node) => node.toJSON()),
    };
  }

  accept(visitor: Visitor) {
    visitor.visit?.(this);
    visitor.visitOneof?.(this);
    for (const node of this.body) node.accept(visitor);
  }

  static async parse(scanner: Scanner, syntax: 2 | 3 = 3): Promise<Oneof> {
    if (scanner.contents !== "oneof") {
      await nextTokenIs(scanner, Token.identifier, "oneof");
    }
    const start = scanner.startPos;
    const name = await expectSimpleIdent(scanner);
    const body: OneofStatement[] = [];
    await nextTokenIs(scanner, Token.token, "{");
    for await (const token of scanner) {
      if (token === Token.token && scanner.contents === "}") {
        return new Oneof(name, body, start, scanner.endPos);
      }
      if (token === Token.identifier && scanner.contents === "group") {
        body.push(await Group.parse(scanner, syntax));
      } else {
        body.push(await Field.parse(scanner, syntax));
      }
    }
    throw new TokenError(scanner, Token.eof);
  }
}
