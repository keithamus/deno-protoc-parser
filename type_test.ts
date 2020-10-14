import { assertNode, assertNodeThrows } from "./testutil.ts";
import { Type } from "./type.ts";

Deno.test("Type", async () => {
  const tt: [string, Type, 2 | 3][] = [
    [
      `float`,
      new Type(
        "float",
        [1, 1],
        [1, 5],
      ),
      2,
    ],
    [
      `.Foo`,
      new Type(
        ".Foo",
        [1, 1],
        [1, 4],
      ),
      2,
    ],
    [
      `foo.bar`,
      new Type(
        "foo.bar",
        [1, 1],
        [1, 7],
      ),
      3,
    ],
  ];
  for (const t of tt) await assertNode(Type, ...t);
});

Deno.test("Type errors", async () => {
  const tt: [string, string][] = [
    [
      `foo..bar`,
      "unexpected token (.) on line 1, column 5; expected identifier",
    ],
  ];
  for (const t of tt) await assertNodeThrows(Type, ...t);
});
