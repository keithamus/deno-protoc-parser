import { ParseNode, Visitor } from "./parsenode.ts";
import { FieldOption, Comment } from "./nodes.ts";
import { Scanner, Token, nextTokenIs, TokenError } from "./deps.ts";
import { expectSimpleIdent } from "./util.ts";

export class Field extends ParseNode {
  repeated: boolean;
  optional: boolean;
  required: boolean;
  constructor(
    public fieldType: string,
    public name: string,
    public id: number,
    { repeated = false, optional = false, required = false } = {},
    public options: FieldOption[] = [],
    public start: [number, number] = [0, 0],
    public end: [number, number] = [0, 0],
    public comments: Comment[] = [],
  ) {
    super();
    this.repeated = repeated;
    this.optional = optional;
    this.required = required;
  }

  toProto(syntax: 2 | 3 = 3) {
    let comments = "";
    if (this.comments.length) {
      comments = this.comments.map((node) => node.toProto()).join("\n") + "\n";
    }
    let str: string[] = [];
    if (this.required && syntax === 3) {
      throw new Error("required fields are not allowed in Proto3");
    }
    if (this.optional && syntax === 3) {
      throw new Error("optional fields are not allowed in Proto3");
    }
    if (this.repeated) str.push("repeated");
    if (this.optional) str.push("optional");
    if (this.required) str.push("required");
    str.push(this.fieldType, this.name, "=", String(this.id));
    if (this.options.length) {
      str.push(
        `[${this.options.map((option) => option.toProto()).join(", ")}]`,
      );
    }
    return `${comments}${str.join(" ")};`;
  }

  toJSON() {
    return Object.assign(
      {
        type: "Field",
        start: this.start,
        end: this.end,
        fieldType: this.fieldType,
        name: this.name,
        id: this.id,
        options: this.options.map((node) => node.toJSON()),
        repeated: this.repeated,
        optional: this.optional,
        required: this.required,
      },
      this.comments.length
        ? { comments: this.comments.map((node) => node.toJSON()) }
        : {},
    );
  }

  accept(visitor: Visitor) {
    visitor.visit?.(this);
    visitor.visitField?.(this);
    for (const node of this.options) node.accept(visitor);
    for (const node of this.comments) node.accept(visitor);
  }

  static async parse(scanner: Scanner, syntax: 2 | 3 = 3): Promise<Field> {
    if (!scanner.contents) await scanner.scan();
    const start = scanner.startPos;
    const label = scanner.contents;
    const opts = { repeated: false, optional: false, required: false };
    if (label === "optional") {
      if (syntax === 3) {
        throw new TokenError(
          scanner,
          Token.identifier,
          Token.identifier,
          "(optional fields are not allowed in Proto3)",
        );
      }
      opts.optional = true;
      await nextTokenIs(scanner, Token.identifier);
    } else if (label === "required") {
      if (syntax === 3) {
        throw new TokenError(
          scanner,
          Token.identifier,
          Token.identifier,
          "(required fields are not allowed in Proto3)",
        );
      }
      opts.required = true;
      await nextTokenIs(scanner, Token.identifier);
    } else if (label === "repeated") {
      opts.repeated = true;
      await nextTokenIs(scanner, Token.identifier);
    }
    const fieldType = scanner.contents;
    const name = await expectSimpleIdent(scanner);
    await nextTokenIs(scanner, Token.token, "=");
    const id = Number(await nextTokenIs(scanner, Token.int));
    let str = await nextTokenIs(scanner, Token.token);
    const fieldOptions: FieldOption[] = [];
    if (str === "[") {
      for await (const token of scanner) {
        if (token === Token.token && scanner.contents === "]") {
          str = await nextTokenIs(scanner, Token.token);
          break;
        }
        fieldOptions.push(await FieldOption.parse(scanner));
        await nextTokenIs(scanner, Token.token);
        if (scanner.contents === "]") {
          str = await nextTokenIs(scanner, Token.token);
          break;
        } else if (scanner.contents === ",") {
          continue;
        }
        throw new TokenError(scanner, Token.token, Token.token, ", or ]");
      }
    }
    if (str === ";") {
      return new Field(
        fieldType,
        name,
        id,
        opts,
        fieldOptions,
        start,
        scanner.endPos,
      );
    }
    throw new TokenError(scanner, Token.token, Token.token, "; or [");
  }
}
