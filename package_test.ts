import { assertNode, assertNodeThrows } from "./testutil.ts";
import { Package } from "./package.ts";

Deno.test("Package", async () => {
  const tt: [string, Package][] = [
    [`package foo;`, new Package("foo", [1, 1], [1, 12])],
    [`package foo.bar;`, new Package("foo.bar", [1, 1], [1, 16])],
    [`package foo_bar;`, new Package("foo_bar", [1, 1], [1, 16])],
  ];
  for (const t of tt) await assertNode(Package, ...t);
});

Deno.test("Package errors", async () => {
  const tt: [string, string][] = [
    [`package foo`, "unexpected eof on line 1, column 11"],
    [
      `package _foo`,
      "unexpected token (_) on line 1, column 9; expected identifier",
    ],
    [
      `package 1foo`,
      "unexpected int (1) on line 1, column 9; expected identifier",
    ],
    [
      `package foo..bar`,
      "unexpected token (.) on line 1, column 13; expected identifier",
    ],
  ];
  for (const t of tt) await assertNodeThrows(Package, ...t);
});
