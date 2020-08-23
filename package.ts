import { ParseNode } from "./parsenode.ts";
import { Visitor } from "./visitor.ts";
import { Scanner, Token, nextTokenIs } from "./deps.ts";
import { expectFullIdent } from "./util.ts";

/**
 * Represents a Package definition.
 *
 * The package specifier can be used to prevent name clashes between protocol
 * message types.
 *
 * https://developers.google.com/protocol-buffers/docs/reference/proto3-spec#package
 */
export class Package extends ParseNode {
  constructor(
    /**
     * The given name of a package. This is a "fullIdent" so may contain dots.
     */
    public name: string,
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

  toProto() {
    return `package ${this.name};`;
  }

  toJSON() {
    return {
      type: "Package",
      start: this.start,
      end: this.end,
      name: this.name,
    };
  }

  accept(visitor: Visitor) {
    visitor.visit?.(this);
    visitor.visitPackage?.(this);
  }

  static async parse(scanner: Scanner): Promise<Package> {
    if (scanner.contents !== "package") {
      await nextTokenIs(scanner, Token.keyword, "package");
    }
    const start = scanner.startPos;
    const name = await expectFullIdent(scanner);
    await nextTokenIs(scanner, Token.token, ";");
    return new Package(name, start, scanner.endPos);
  }
}
