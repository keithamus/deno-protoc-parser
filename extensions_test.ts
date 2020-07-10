import { assertNode, assertNodeThrows } from "./testutil.ts";
import { Extensions } from "./extensions.ts";

Deno.test("Extensions", async () => {
  const tt: [string, Extensions, 2 | 3][] = [
    [`extensions 2;`, new Extensions([[2, 2]], [1, 1], [1, 13]), 2],
    [`extensions 2 to 5;`, new Extensions([[2, 5]], [1, 1], [1, 18]), 2],
    [
      `extensions 2 to max;`,
      new Extensions([[2, Infinity]], [1, 1], [1, 20]),
      2,
    ],
    [
      `extensions 2, 15, 9 to 11;`,
      new Extensions([[2, 2], [15, 15], [9, 11]], [1, 1], [1, 26]),
      2,
    ],
    [
      `extensions 2 to 3, 4 to 5, 6 to 7, 8 to max;`,
      new Extensions([[2, 3], [4, 5], [6, 7], [8, Infinity]], [1, 1], [1, 44]),
      2,
    ],
  ];
  for (const t of tt) await assertNode(Extensions, ...t);
});

Deno.test("Extensions errors", async () => {
  const tt: [string, string, 2 | 3][] = [
    [
      `extensions max to 2;`,
      `unexpected identifier (max) on line 1, column 12`,
      2,
    ],
    [`extensions 2 to 5`, `unexpected eof on line 1, column 17`, 2],
    [
      `extensions "foo", 2;`,
      `unexpected string ("foo") on line 1, column 12`,
      2,
    ],
    [
      `extensions 2, "foo";`,
      `unexpected string ("foo") on line 1, column 15`,
      2,
    ],
    [
      `extensions 2 to min;`,
      `unexpected identifier (min) on line 1, column 17`,
      2,
    ],
  ];
  for (const t of tt) await assertNodeThrows(Extensions, ...t);
});
