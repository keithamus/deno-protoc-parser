import type { ParseNode } from "./parsenode.ts";
import type { Proto } from "./proto.ts";
import type { Message } from "./message.ts";
import type { Constant } from "./constant.ts";
import type { Enum } from "./enum.ts";
import type { EnumField } from "./enumfield.ts";
import type { Extend } from "./extend.ts";
import type { Extensions } from "./extensions.ts";
import type { Field } from "./field.ts";
import type { Group } from "./group.ts";
import type { FieldOption } from "./fieldoption.ts";
import type { Import } from "./import.ts";
import type { MapField } from "./mapfield.ts";
import type { Oneof } from "./oneof.ts";
import type { Option } from "./option.ts";
import type { Package } from "./package.ts";
import type { RPC } from "./rpc.ts";
import type { Reserved } from "./reserved.ts";
import type { Service } from "./service.ts";
import type { Syntax } from "./syntax.ts";
import type { Comment } from "./comment.ts";

/**
 * Pass an object matching the Visitor interface to any Node's `accept()`
 * function to have the visit*() methods called with the respective Nodes.
 */
export interface Visitor {
  /**
   * This will be called for every Node in the AST.
   */
  visit?: (node: ParseNode) => void;
  /**
   * This will be called for every Proto Node in the AST.
   * There is typically 1 Proto node at the very top.
   */
  visitProto?: (node: Proto) => void;
  /**
   * This will be called for every Message Node in the AST.
   */
  visitMessage?: (node: Message) => void;
  /**
   * This will be called for every Constant Node in the AST.
   */
  visitConstant?: (node: Constant) => void;
  /**
   * This will be called for every Enum Node in the AST.
   */
  visitEnum?: (node: Enum) => void;
  /**
   * This will be called for every EnumField Node in the AST.
   */
  visitEnumField?: (node: EnumField) => void;
  /**
   * This will be called for every Extend Node in the AST.
   */
  visitExtend?: (node: Extend) => void;
  /**
   * This will be called for every Extensions Node in the AST.
   */
  visitExtensions?: (node: Extensions) => void;
  /**
   * This will be called for every Field Node in the AST.
   */
  visitField?: (node: Field) => void;
  /**
   * This will be called for every Group Node in the AST.
   */
  visitGroup?: (node: Group) => void;
  /**
   * This will be called for every FieldOption Node in the AST.
   */
  visitFieldOption?: (node: FieldOption) => void;
  /**
   * This will be called for every Import Node in the AST.
   */
  visitImport?: (node: Import) => void;
  /**
   * This will be called for every MapField Node in the AST.
   */
  visitMapField?: (node: MapField) => void;
  /**
   * This will be called for every Oneof Node in the AST.
   */
  visitOneof?: (node: Oneof) => void;
  /**
   * This will be called for every Option Node in the AST.
   */
  visitOption?: (node: Option) => void;
  /**
   * This will be called for every Package Node in the AST.
   */
  visitPackage?: (node: Package) => void;
  /**
   * This will be called for every RPC Node in the AST.
   */
  visitRPC?: (node: RPC) => void;
  /**
   * This will be called for every Reserved Node in the AST.
   */
  visitReserved?: (node: Reserved) => void;
  /**
   * This will be called for every Service Node in the AST.
   */
  visitService?: (node: Service) => void;
  /**
   * This will be called for every Syntax Node in the AST.
   */
  visitSyntax?: (node: Syntax) => void;
  /**
   * This will be called for every Comment Node in the AST.
   */
  visitComment?: (node: Comment) => void;
}
