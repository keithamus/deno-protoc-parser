import {
  assertEquals,
  assertThrowsAsync,
} from "https://deno.land/std@0.64.0/testing/asserts.ts";
import {StringReader} from "https://deno.land/std@0.64.0/io/readers.ts";
import {ParseNode, ParseNodeJSON} from "./parsenode.ts";
import { Scanner } from "./deps.ts";
import { protoScanner } from "./protoscanner.ts";
import { Proto } from "./proto.ts";

interface Parseable {
  name: string;
  parse(scanner: Scanner, syntax?: 2 | 3): Promise<ParseNode>;
}

function collectTypes(json: unknown): string[] {
  const collected: string[] = [];
  JSON.stringify(json, (key, value) => {
    if (key === "type") collected.push(String(value));
    return value;
  });
  return collected;
}

function assertVisitorPattern(instance: ParseNode) {
  const actual: string[] = [];
  let checkedSelf = false;
  const visitor = {
    visit(node: ParseNode) {
      actual.push(node.toJSON().type);
    },
    [`visit${instance.constructor.name}`](node: ParseNode) {
      if (!checkedSelf) assertEquals(instance, node);
      checkedSelf = true;
    },
  };
  instance.accept(visitor), assertEquals(actual, collectTypes(instance));
}

export async function assertNode(
  Class: Parseable,
  str: string,
  json: ParseNode,
  version: 2 | 3 = 3,
  { comments = false } = {},
) {
  const scanner = protoScanner(new StringReader(str), { comments });
  const instance = await Class.parse(scanner, version);
  const ijson = instance.toJSON();
  assertEquals(ijson.type, Class.name);
  assertEquals(ijson.start, json.start);
  assertEquals(ijson.end, json.end);
  assertEquals(ijson, json.toJSON());
  assertEquals(str, instance.toProto(version));
  assertVisitorPattern(instance);
}

export async function assertNodeThrows(
  Class: Parseable,
  str: string,
  msgIncludes: string,
  version: 2 | 3 = 3,
) {
  const scanner = protoScanner(new StringReader(str));
  await assertThrowsAsync(
    () => Class.parse(scanner, version),
    SyntaxError,
    msgIncludes,
  );
}

type jsonable = {toJSON: () => unknown};

function stripPositionalData(ast: ParseNode | ParseNodeJSON): ParseNodeJSON {
  if (ast && typeof ast.toJSON === "function") {
    return stripPositionalData(ast.toJSON());
  }
  ast = (ast as ParseNodeJSON)
  const newAst: ParseNodeJSON = {type: '', start: [0, 0], end: [0, 0]};
  for (const v in ast) {
    if (v === "start" || v === "end") continue
    if (typeof ast[v] === "object") {
      newAst[v] = stripPositionalData(ast[v] as ParseNodeJSON);
    } else {
      newAst[v] = ast[v]
    }
  }
  return newAst;
}

export function testFile(
  name: string,
  syntax: 2 | 3 = 3,
  { write = false, comments = false } = {},
) {
  return {
    name: `${name}.proto`,
    async fn() {
      const astFile = `./testdata/${name}.ast.json`;
      const protoFile = `./testdata/${name}.proto`;
      const file = await Deno.open(protoFile);
      let proto: Proto = new Proto([]);
      let ast: ParseNodeJSON;
      try {
        proto = await Proto.parse(protoScanner(file, {comments}));
        ast = JSON.parse(await Deno.readTextFile(astFile)) as ParseNodeJSON;
        assertEquals(
          stripPositionalData(proto.toJSON()),
          stripPositionalData(ast),
        );
        assertEquals(proto.toJSON(), ast);
        const generatedProto = await Proto.parse(
          protoScanner(new StringReader(proto.toProto(syntax)), { comments }),
        );
        assertEquals(
          stripPositionalData(generatedProto),
          stripPositionalData(ast),
        );
        assertVisitorPattern(proto);
      } catch (e) {
        if (ast! && write) {
          await Deno.writeTextFile(
            astFile,
            JSON.stringify(proto.toJSON(), null, 2),
          );
        }
        throw e;
      } finally {
        file.close();
      }
    },
  };
}
