export { Proto } from "./proto.ts";
export type { Visitor } from "./visitor.ts";
export { Message } from "./message.ts";
export { Constant } from "./constant.ts";
export { Enum } from "./enum.ts";
export { EnumField } from "./enumfield.ts";
export { Extend } from "./extend.ts";
export { Extensions } from "./extensions.ts";
export { Field } from "./field.ts";
export { Group } from "./group.ts";
export { FieldOption } from "./fieldoption.ts";
export { Import } from "./import.ts";
export { MapField } from "./mapfield.ts";
export { Oneof } from "./oneof.ts";
export { Option } from "./option.ts";
export { Package } from "./package.ts";
export { RPC } from "./rpc.ts";
export { Reserved } from "./reserved.ts";
export { Service } from "./service.ts";
export { Syntax } from "./syntax.ts";
export { Comment } from "./comment.ts";
export type { ProtoScannerInit } from "./protoscanner.ts";

import { protoScanner, ProtoScannerInit } from "./protoscanner.ts";
import { Proto } from "./proto.ts";

/**
 * Parse the contents of a Reader, returning a `Proto` AST node.
 */
export async function parse (
  reader: Deno.Reader,
  init: ProtoScannerInit,
): Promise<Proto> {
  return await Proto.parse(protoScanner(reader, init));
}
