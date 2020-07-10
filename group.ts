import { ParseNode, ParseNodeJSON, Visitor } from "./parsenode.ts";
import { Scanner, Token, nextTokenIs, TokenError } from "./deps.ts";
import {
  Field,
  Enum,
  Message,
  Option,
  Extend,
  Extensions,
  Oneof,
  MapField,
  Reserved,
} from "./nodes.ts";
import { expectSimpleIdent } from "./util.ts";

type MessageStatement =
  | Field
  | Enum
  | Message
  | Extend
  | Extensions
  | Option
  | Oneof
  | MapField
  | Reserved;

export class Group extends ParseNode {
  repeated: boolean;
  optional: boolean;
  required: boolean;
  constructor(
    public name: string,
    public id: number,
    public body: MessageStatement[] = [],
    { repeated = false, optional = false, required = false } = {},
    public start: [number, number] = [0, 0],
    public end: [number, number] = [0, 0],
  ) {
    super();
    this.repeated = repeated;
    this.optional = optional;
    this.required = required;
  }

  toProto(syntax: 2 | 3 = 3) {
    if (syntax === 3) {
      throw new Error("Group fields are not allowed in Proto3");
    }
    let label = "";
    if (this.optional) {
      label = "optional ";
    }
    if (this.repeated) {
      label = "repeated ";
    }
    if (this.required) {
      label = "required ";
    }
    let body = "";
    if (this.body.length) {
      body = `\n  ${
        this.body.map((node) => node.toProto(syntax)).join("\n  ")
      }\n`;
    }
    return `${label}group ${this.name} = ${this.id} {${body}}`;
  }

  toJSON(): ParseNodeJSON {
    return {
      type: "Group",
      start: this.start,
      end: this.end,
      name: this.name,
      id: this.id,
      repeated: this.repeated,
      optional: this.optional,
      required: this.required,
      body: this.body.map((node) => node.toJSON()),
    };
  }

  accept(visitor: Visitor) {
    visitor.visit?.(this);
    visitor.visitGroup?.(this);
    for (const node of this.body) node.accept(visitor);
  }

  static async parse(scanner: Scanner, syntax: 2 | 3 = 3): Promise<Group> {
    if (!scanner.contents) await scanner.scan();
    if (syntax === 3) {
      throw new TokenError(
        scanner,
        Token.identifier,
        Token.identifier,
        "(Group fields are not allowed in Proto3)",
      );
    }
    const start = scanner.startPos;
    const opts = { repeated: false, optional: false, required: false };
    if (scanner.contents === "repeated") {
      opts.repeated = true;
      await nextTokenIs(scanner, Token.identifier, "group");
    }
    if (scanner.contents === "optional") {
      opts.optional = true;
      await nextTokenIs(scanner, Token.identifier, "group");
    }
    if (scanner.contents === "required") {
      opts.required = true;
      await nextTokenIs(scanner, Token.identifier, "group");
    }
    const name = await expectSimpleIdent(scanner);
    if (name[0].toUpperCase() !== name[0]) {
      throw new TokenError(
        scanner,
        Token.identifier,
        Token.identifier,
        "(Group names must start with a capital letter)",
      );
    }
    await nextTokenIs(scanner, Token.token, "=");
    const id = Number(await nextTokenIs(scanner, Token.int));
    const body: MessageStatement[] = [];
    await nextTokenIs(scanner, Token.token, "{");
    for await (const token of scanner) {
      const str = scanner.contents;
      if (token === Token.token && str === "}") {
        return new Group(name, id, body, opts, start, scanner.endPos);
      } else if (token === Token.token && str === ";") {
        // Empty statements are allowed!
      } else if (token === Token.keyword && str === "repeated") {
        body.push(await Field.parse(scanner, syntax));
      } else if (token === Token.keyword && str === "optional") {
        body.push(await Field.parse(scanner, syntax));
      } else if (token === Token.keyword && str === "required") {
        body.push(await Field.parse(scanner, syntax));
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
      } else {
        throw new TokenError(scanner, token);
      }
    }
    throw new TokenError(scanner, Token.eof);
  }
}
