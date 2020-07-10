import { assertNode, assertNodeThrows } from "./testutil.ts";
import { Syntax } from "./syntax.ts";

Deno.test("Syntax", async () => {
  const tt: [string, Syntax][] = [
    [`syntax = "proto3";`, new Syntax(3, [1, 1], [1, 18])],
  ];
  for (const t of tt) await assertNode(Syntax, ...t);
});

Deno.test("Syntax errors", async () => {
  const tt: [string, string][] = [
    [
      `syntax = "proto3"`,
      `unexpected eof on line 1, column 17`,
    ],
    [
      `syntax = "3";`,
      `unexpected string ("3") on line 1, column 10; expected string 'proto2' or 'proto3'`,
    ],
    [
      `syntax = "proto4";`,
      `unexpected string ("proto4") on line 1, column 10; expected string 'proto2' or 'proto3'`,
    ],
  ];
  for (const t of tt) await assertNodeThrows(Syntax, ...t);
});
