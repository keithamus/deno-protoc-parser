import { assertNode, assertNodeThrows } from "./testutil.ts";
import { Reserved } from "./reserved.ts";

Deno.test("Reserved", async () => {
  const tt: [string, Reserved][] = [
    [`reserved 2;`, new Reserved([[2, 2]], [1, 1], [1, 11])],
    [`reserved 2 to 5;`, new Reserved([[2, 5]], [1, 1], [1, 16])],
    [`reserved 2 to max;`, new Reserved([[2, Infinity]], [1, 1], [1, 18])],
    [
      `reserved 2, 15, 9 to 11;`,
      new Reserved([[2, 2], [15, 15], [9, 11]], [1, 1], [1, 24]),
    ],
    [
      `reserved 2 to 3, 4 to 5, 6 to 7, 8 to max;`,
      new Reserved([[2, 3], [4, 5], [6, 7], [8, Infinity]], [1, 1], [1, 42]),
    ],
    [`reserved "foo", "bar";`, new Reserved(["foo", "bar"], [1, 1], [1, 22])],
  ];
  for (const t of tt) await assertNode(Reserved, ...t);
});

Deno.test("Reserved errors", async () => {
  const tt: [string, string][] = [
    [`reserved max to 2;`, `unexpected identifier (max) on line 1, column 10`],
    [`reserved 2 to 5`, `unexpected eof on line 1, column 15`],
    [`reserved "foo", 2;`, `unexpected int (2) on line 1, column 17`],
    [`reserved 2, "foo";`, `unexpected string ("foo") on line 1, column 13`],
    [`reserved 2 to min;`, `unexpected identifier (min) on line 1, column 15`],
  ];
  for (const t of tt) await assertNodeThrows(Reserved, ...t);
});
