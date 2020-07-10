import { ParseNode, Visitor } from "./parsenode.ts";
import { Scanner, Token, nextTokenIs, TokenError } from "./deps.ts";

function rangeToString(value: [number, number]): string {
  const [from, to] = value;
  if (from === to) return `${from}`;
  if (to === Infinity) return `${from} to max`;
  return `${from} to ${to}`;
}

export class Extensions extends ParseNode {
  constructor(
    public ranges: [number, number][] = [],
    public start: [number, number] = [0, 0],
    public end: [number, number] = [0, 0],
  ) {
    super();
  }

  toProto() {
    return `extensions ${this.ranges.map(rangeToString).join(", ")};`;
  }

  toJSON() {
    return {
      type: "Extensions",
      start: this.start,
      end: this.end,
      ranges: this.ranges.map((
        [from, to],
      ) => [from, to === Infinity ? "max" : to]),
    };
  }

  accept(visitor: Visitor) {
    visitor.visit?.(this);
    visitor.visitExtensions?.(this);
  }

  static async parse(scanner: Scanner, syntax: 2 | 3 = 3): Promise<Extensions> {
    if (scanner.contents !== "extensions") {
      await nextTokenIs(scanner, Token.keyword, "extensions");
    }
    if (syntax === 3) {
      throw new TokenError(
        scanner,
        Token.identifier,
        Token.identifier,
        "Extensions are not allowed in Proto3",
      );
    }
    const start = scanner.startPos;
    const ranges: [number, number][] = [];
    let passComma = false;
    let from: number | void;
    for await (const token of scanner) {
      const str = scanner.contents;
      if (token === Token.token && str === "," && passComma) {
        if (from !== undefined) ranges.push([from, from]);
        passComma = false;
        from = undefined;
      } else if (token === Token.int && from === undefined) {
        passComma = true;
        from = Number(str);
      } else if (
        token === Token.identifier && str === "to" && from !== undefined
      ) {
        passComma = true;
        const token = await scanner.scan();
        if (token === Token.identifier && scanner.contents === "max") {
          ranges.push([from, Infinity]);
          from = undefined;
        } else if (token === Token.int) {
          ranges.push([from, Number(scanner.contents)]);
          from = undefined;
        } else {
          throw new TokenError(scanner, token, Token.int, "or max");
        }
      } else if (token === Token.token && scanner.contents === ";") {
        if (from !== undefined) ranges.push([from, from]);
        return new Extensions(ranges, start, scanner.endPos);
      } else {
        throw new TokenError(scanner, token);
      }
    }
    throw new TokenError(scanner, Token.eof);
  }
}
