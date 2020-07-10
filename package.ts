import { ParseNode, Visitor } from "./parsenode.ts";
import { Scanner, Token, nextTokenIs } from "./deps.ts";
import { expectFullIdent } from "./util.ts";

export class Package extends ParseNode {
  constructor(
    public name: string,
    public start: [number, number] = [0, 0],
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
