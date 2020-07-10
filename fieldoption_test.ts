import { assertNode, assertNodeThrows } from "./testutil.ts";
import { FieldOption } from "./fieldoption.ts";
import { Constant } from "./constant.ts";

Deno.test("FieldOption", async () => {
  const tt: [string, FieldOption][] = [
    [
      `default = true`,
      new FieldOption(
        "default",
        new Constant("boolean", "true", [1, 11], [1, 14]),
        [1, 1],
        [1, 14],
      ),
    ],
    [
      `hello = "world"`,
      new FieldOption(
        "hello",
        new Constant("string", '"world"', [1, 9], [1, 15]),
        [1, 1],
        [1, 15],
      ),
    ],
    [
      `full.ident = full.ident`,
      new FieldOption(
        "full.ident",
        new Constant("identifier", "full.ident", [1, 14], [1, 23]),
        [1, 1],
        [1, 23],
      ),
    ],
    [
      `under_bar = 10`,
      new FieldOption(
        "under_bar",
        new Constant("int", "10", [1, 13], [1, 14]),
        [1, 1],
        [1, 14],
      ),
    ],
    [
      `bar = 10.01`,
      new FieldOption(
        "bar",
        new Constant("float", "10.01", [1, 7], [1, 11]),
        [1, 1],
        [1, 11],
      ),
    ],
    [
      `foo = -10`,
      new FieldOption(
        "foo",
        new Constant("int", "-10", [1, 7], [1, 9]),
        [1, 1],
        [1, 9],
      ),
    ],
    [
      `baz = -1e4`,
      new FieldOption(
        "baz",
        new Constant("float", "-1e4", [1, 7], [1, 10]),
        [1, 1],
        [1, 10],
      ),
    ],
  ];
  for (const t of tt) await assertNode(FieldOption, ...t);
});

Deno.test("FieldOption errors", async () => {
  const tt: [string, string][] = [
    [`default;`, "unexpected token (;) on line 1, column 8"],
    [`default]`, "unexpected token (]) on line 1, column 8"],
    [`default`, "unexpected eof on line 1, column 7"],
  ];
  for (const t of tt) await assertNodeThrows(FieldOption, ...t);
});
