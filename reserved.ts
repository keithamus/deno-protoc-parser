import { ParseNode } from "./parsenode.ts";
import { Visitor } from "./visitor.ts";
import { Scanner, Token, nextTokenIs, TokenError } from "./deps.ts";

type RangeSet = Array<[number, number]> | Array<string>;

function rangeToString(value: [number, number] | string): string {
  if (typeof value === "string") return `"${value}"`;
  const [from, to] = value;
  if (from === to) return `${from}`;
  if (to === Infinity) return `${from} to max`;
  return `${from} to ${to}`;
}

export class Reserved extends ParseNode {
  constructor(
    public ranges: RangeSet = [],
    public start: [number, number] = [0, 0],
    public end: [number, number] = [0, 0],
  ) {
    super();
  }

  toProto() {
    return `reserved ${
      (this.ranges as Array<[number, number] | string>).map(rangeToString).join(
        ", ",
      )
    };`;
  }

  toJSON() {
    return {
      type: "Reserved",
      start: this.start,
      end: this.end,
      ranges: this.ranges,
    };
  }

  accept(visitor: Visitor) {
    visitor.visit?.(this);
    visitor.visitReserved?.(this);
  }

  static async parse(scanner: Scanner): Promise<Reserved> {
    if (scanner.contents !== "reserved") {
      await nextTokenIs(scanner, Token.identifier, "reserved");
    }
    const start = scanner.startPos;
    const token = await scanner.scan();
    let passComma = true;
    if (token === Token.string) {
      const fieldNames: string[] = [scanner.contents.slice(1, -1)];
      for await (const token of scanner) {
        if (token === Token.token && scanner.contents === "," && passComma) {
          passComma = false;
        } else if (token === Token.string) {
          fieldNames.push(scanner.contents.slice(1, -1));
          passComma = true;
        } else if (token === Token.token && scanner.contents === ";") {
          return new Reserved(fieldNames, start, scanner.endPos);
        } else {
          throw new TokenError(scanner, token);
        }
      }
    } else if (token === Token.int) {
      const ranges: [number, number][] = [];
      let from: number | void = Number(scanner.contents);
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
          return new Reserved(ranges, start, scanner.endPos);
        } else {
          throw new TokenError(scanner, token);
        }
      }
    } else {
      throw new TokenError(scanner, token);
    }
    throw new TokenError(scanner, Token.eof);
  }
}
