import { assertNode, assertNodeThrows } from "./testutil.ts";
import { FieldOption } from "./fieldoption.ts";
import { Constant } from "./constant.ts";

Deno.test("FieldOption", async () => {
  const tt: [string, FieldOption][] = [
    [
      `default = true`,
      new FieldOption(
        ["default"],
        false,
        new Constant("boolean", "true", [1, 11], [1, 14]),
        [1, 1],
        [1, 14],
      ),
    ],
    [
      `hello = "world"`,
      new FieldOption(
        ["hello"],
        false,
        new Constant("string", '"world"', [1, 9], [1, 15]),
        [1, 1],
        [1, 15],
      ),
    ],
    [
      `full.ident = full.ident`,
      new FieldOption(
        ["full.ident"],
        false,
        new Constant("identifier", "full.ident", [1, 14], [1, 23]),
        [1, 1],
        [1, 23],
      ),
    ],
    [
      `under_bar = 10`,
      new FieldOption(
        ["under_bar"],
        false,
        new Constant("int", "10", [1, 13], [1, 14]),
        [1, 1],
        [1, 14],
      ),
    ],
    [
      `bar = 10.01`,
      new FieldOption(
        ["bar"],
        false,
        new Constant("float", "10.01", [1, 7], [1, 11]),
        [1, 1],
        [1, 11],
      ),
    ],
    [
      `foo = -10`,
      new FieldOption(
        ["foo"],
        false,
        new Constant("int", "-10", [1, 7], [1, 9]),
        [1, 1],
        [1, 9],
      ),
    ],
    [
      `baz = -1e4`,
      new FieldOption(
        ["baz"],
        false,
        new Constant("float", "-1e4", [1, 7], [1, 10]),
        [1, 1],
        [1, 10],
      ),
    ],
    [
      `(field_option) = true`,
      new FieldOption(
        ["field_option"],
        true,
        new Constant("boolean", "true", [1, 18], [1, 21]),
        [1, 1],
        [1, 21],
      ),
    ],
    [
      `(my.custom).nested = true`,
      new FieldOption(
        ["my.custom", "nested"],
        true,
        new Constant("boolean", "true", [1, 22], [1, 25]),
        [1, 1],
        [1, 25],
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
