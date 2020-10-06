import { assertNode, assertNodeThrows } from "./testutil.ts";
import { MapField } from "./mapfield.ts";
import { Type } from "./type.ts";

Deno.test("MapField", async () => {
  const tt: [string, MapField, 2 | 3][] = [
    [
      `map<int32, bar> foo = 3;`,
      new MapField(
        "int32",
        new Type("bar", [1, 12], [1, 14]),
        "foo",
        3,
        [1, 1],
        [1, 24],
      ),
      2,
    ],
  ];
  for (const t of tt) await assertNode(MapField, ...t);
});

Deno.test("MapField errors", async () => {
  const tt: [string, string][] = [
    [
      `map<blah, bar> foo = 3;`,
      `unexpected identifier (blah) on line 1, column 5; expected identifier (one of int32, int64, uint32, uint64, sint32, sint64, fixed32, fixed64, sfixed32, sfixed64, bool, string)`,
    ],
  ];
  for (const t of tt) await assertNodeThrows(MapField, ...t);
});
