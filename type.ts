import { ParseNode } from "./parsenode.ts";
import { Visitor } from "./visitor.ts";
import { Scanner } from "./deps.ts";

/**
 * Represents a Type.
 *
 * https://developers.google.com/protocol-buffers/docs/reference/proto3-spec#fields
 */
export class Type extends ParseNode {
  constructor(
    /**
     * The name of a type.
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
    return this.name;
  }

  toJSON() {
    return {
      type: "Type",
      start: this.start,
      end: this.end,
      name: this.name,
    };
  }

  accept(visitor: Visitor) {
    visitor.visit?.(this);
    visitor.visitType?.(this);
  }

  static async parse(scanner: Scanner): Promise<Type>;
}
