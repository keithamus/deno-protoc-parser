import { ParseNode } from "./parsenode.ts";
import { Proto } from "./proto.ts";
import { Message } from "./message.ts";
import { Constant } from "./constant.ts";
import { Enum } from "./enum.ts";
import { EnumField } from "./enumfield.ts";
import { Extend } from "./extend.ts";
import { Extensions } from "./extensions.ts";
import { Field } from "./field.ts";
import { Group } from "./group.ts";
import { FieldOption } from "./fieldoption.ts";
import { Import } from "./import.ts";
import { MapField } from "./mapfield.ts";
import { Oneof } from "./oneof.ts";
import { Option } from "./option.ts";
import { Package } from "./package.ts";
import { RPC } from "./rpc.ts";
import { Reserved } from "./reserved.ts";
import { Service } from "./service.ts";
import { Syntax } from "./syntax.ts";
import { Comment } from "./comment.ts";

export {
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
};

export interface Visitor {
  visit?: (node: ParseNode) => void;
  visitProto?: (node: Proto) => void;
  visitMessage?: (node: Message) => void;
  visitConstant?: (node: Constant) => void;
  visitEnum?: (node: Enum) => void;
  visitEnumField?: (node: EnumField) => void;
  visitExtend?: (node: Extend) => void;
  visitExtensions?: (node: Extensions) => void;
  visitField?: (node: Field) => void;
  visitGroup?: (node: Group) => void;
  visitFieldOption?: (node: FieldOption) => void;
  visitImport?: (node: Import) => void;
  visitMapField?: (node: MapField) => void;
  visitOneof?: (node: Oneof) => void;
  visitOption?: (node: Option) => void;
  visitPackage?: (node: Package) => void;
  visitRPC?: (node: RPC) => void;
  visitReserved?: (node: Reserved) => void;
  visitService?: (node: Service) => void;
  visitSyntax?: (node: Syntax) => void;
  visitComment?: (node: Comment) => void;
}
