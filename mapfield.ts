import { Scanner, Token, nextTokenIs, TokenError } from "./deps.ts";
import { ParseNode, Visitor } from "./parsenode.ts";
import { expectSimpleIdent } from "./util.ts";

enum KeyType {
  int32 = "int32",
  int64 = "int64",
  uint32 = "uint32",
  uint64 = "uint64",
  sint32 = "sint32",
  sint64 = "sint64",
  fixed32 = "fixed32",
  fixed64 = "fixed64",
  sfixed32 = "sfixed32",
  sfixed64 = "sfixed64",
  bool = "bool",
  string = "string",
}

export class MapField extends ParseNode {
  keyType: KeyType;
  constructor(
    keyType: KeyType | keyof typeof KeyType,
    public valueType: string,
    public name: string,
    public id: number,
    public start: [number, number] = [0, 0],
    public end: [number, number] = [0, 0],
  ) {
    super();
    this.keyType = KeyType[keyType];
  }

  toProto() {
    return `map<${this.keyType}, ${this.valueType}> ${this.name} = ${this.id};`;
  }

  toJSON() {
    return {
      type: "MapField",
      start: this.start,
      end: this.end,
      keyType: KeyType[this.keyType],
      valueType: this.valueType,
      name: this.name,
      id: this.id,
    };
  }

  accept(visitor: Visitor) {
    visitor.visit?.(this);
    visitor.visitMapField?.(this);
  }

  static async parse(scanner: Scanner): Promise<MapField> {
    if (scanner.contents !== "map") {
      await nextTokenIs(scanner, Token.keyword, "map");
    }
    const start = scanner.startPos;
    await nextTokenIs(scanner, Token.token, "<");
    const keyType = KeyType[
      await nextTokenIs(scanner, Token.identifier) as keyof typeof KeyType
    ];
    if (!keyType) {
      throw new TokenError(
        scanner,
        Token.identifier,
        Token.identifier,
        `(one of ${Object.keys(KeyType).join(", ")})`,
      );
    }
    await nextTokenIs(scanner, Token.token, ",");
    const valueType = await nextTokenIs(scanner, Token.identifier);
    await nextTokenIs(scanner, Token.token, ">");
    const name = await expectSimpleIdent(scanner);
    await nextTokenIs(scanner, Token.token, "=");
    const id = Number(await nextTokenIs(scanner, Token.int));
    await nextTokenIs(scanner, Token.token, ";");
    return new MapField(keyType, valueType, name, id, start, scanner.endPos);
  }
}
