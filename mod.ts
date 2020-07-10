export {
  Visitor,
  Message,
  Constant,
  Enum,
  EnumField,
  Extend,
  Extensions,
  Field,
  Group,
  FieldOption,
  Import,
  MapField,
  Oneof,
  Option,
  Package,
  RPC,
  Reserved,
  Service,
  Syntax,
  Comment,
} from "./nodes.ts";

import { protoScanner, ProtoScannerInit } from "./protoscanner.ts";
import { Proto } from "./proto.ts";

export { Proto, ProtoScannerInit };

export async function parse(reader: Deno.Reader, init: ProtoScannerInit) {
  return await Proto.parse(protoScanner(reader, init));
}
