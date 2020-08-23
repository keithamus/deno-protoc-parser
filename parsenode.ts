import { Scanner, TokenError } from "./deps.ts";
import { Visitor } from "./visitor.ts";

/**
 * The base return type that all `Node.toJSON()` calls will return.
 */
export interface ParseNodeJSON {
  type: string;
  start: [number, number];
  end: [number, number];
  [key: string]: unknown;
}

/**
 * The base class for all Nodes in the AST.
 */
export class ParseNode {
  constructor(
    /**
     * The starting [line, column]
     */
    public start: [number, number] = [0, 0],
    /**
     * The ending [line, column]
     */
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
