import { Scanner, TokenError } from "./deps.ts";
import { Visitor } from "./nodes.ts";

export {
  Visitor,
};

export interface ParseNodeJSON {
  type: string;
  start: [number, number];
  end: [number, number];
  [key: string]: unknown;
}

export class ParseNode {
  constructor(
    public start: [number, number] = [0, 0],
    public end: [number, number] = [0, 0],
  ) {}

  get type(): string {
    return this.constructor.name;
  }

  static async parse(scanner: Scanner, syntax: 2 | 3 = 3): Promise<ParseNode> {
    throw new TokenError(scanner, await scanner.scan());
  }

  toProto(syntax: 2 | 3 = 3): string {
    return ``;
  }

  toJSON(): ParseNodeJSON {
    return { type: "ParseNode", start: this.start, end: this.end };
  }

  accept(visitor: Visitor) {
    visitor.visit?.(this);
  }
}
