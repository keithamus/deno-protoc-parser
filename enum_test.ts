import { assertNode, assertNodeThrows } from "./testutil.ts";
import { Enum } from "./enum.ts";

Deno.test("Enum", async () => {
  const tt: [string, Enum][] = [
    [`enum Foo {}`, new Enum("Foo", [], [1, 1], [1, 11])],
  ];
  for (const t of tt) await assertNode(Enum, ...t);
});

Deno.test("Enum errors", async () => {
  const tt: [string, string][] = [
    [`enum foo {`, "unexpected eof on line 1, column 10"],
    [
      `enum _foo {}`,
      "unexpected token (_) on line 1, column 6; expected identifier",
    ],
    [
      `enum 1foo {}`,
      "unexpected int (1) on line 1, column 6; expected identifier",
    ],
    [
      `enum foo.bar {}`,
      "unexpected token (.) on line 1, column 9; expected identifier",
    ],
  ];
  for (const t of tt) await assertNodeThrows(Enum, ...t);
});
