import { assertNode, assertNodeThrows } from "./testutil.ts";
import { Option } from "./option.ts";
import { Constant } from "./constant.ts";

Deno.test("Option", async () => {
  const tt: [string, Option][] = [
    [
      `option java_package = "com.example.foo";`,
      new Option(
        ["java_package"],
        false,
        new Constant("string", '"com.example.foo"', [1, 23], [1, 39]),
        [1, 1],
        [1, 40],
      ),
    ],
    [
      `option (java_package) = "com.example.foo";`,
      new Option(
        ["java_package"],
        true,
        new Constant("string", '"com.example.foo"', [1, 25], [1, 41]),
        [1, 1],
        [1, 42],
      ),
    ],
    [
      `option (my.custom).nested = "com.example.foo";`,
      new Option(
        ["my.custom", "nested"],
        true,
        new Constant("string", '"com.example.foo"', [1, 29], [1, 45]),
        [1, 1],
        [1, 46],
      ),
    ],
  ];
  for (const t of tt) await assertNode(Option, ...t);
});

Deno.test("Option errors", async () => {
  const tt: [string, string][] = [
    [
      `option = "";`,
      `unexpected token (=) on line 1, column 8; expected identifier`,
    ],
    [
      `option foo..bar = "";`,
      `unexpected token (.) on line 1, column 12; expected identifier`,
    ],
    [
      `option (partial = true;`,
      `unexpected token (=) on line 1, column 17`,
    ],
  ];
  for (const t of tt) await assertNodeThrows(Option, ...t);
});
