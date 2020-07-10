import { assertNode, assertNodeThrows } from "./testutil.ts";
import { Constant } from "./constant.ts";

Deno.test("Constant", async () => {
  const tt: [string, Constant][] = [
    [`true`, new Constant("boolean", "true", [1, 1], [1, 4])],
    [`"world"`, new Constant("string", '"world"', [1, 1], [1, 7])],
    [`full.ident`, new Constant("identifier", "full.ident", [1, 1], [1, 10])],
    [`10`, new Constant("int", "10", [1, 1], [1, 2])],
    [`10.01`, new Constant("float", "10.01", [1, 1], [1, 5])],
    [`-10`, new Constant("int", "-10", [1, 1], [1, 3])],
    [`-1e4`, new Constant("float", "-1e4", [1, 1], [1, 4])],
    [`-inf`, new Constant("int", "-inf", [1, 1], [1, 4])],
    [`+inf`, new Constant("int", "+inf", [1, 1], [1, 4])],
    [`inf`, new Constant("int", "inf", [1, 1], [1, 3])],
    [`nan`, new Constant("int", "nan", [1, 1], [1, 3])],
  ];
  for (const t of tt) await assertNode(Constant, ...t);
});

Deno.test("Constant errors", async () => {
  const tt: [string, string][] = [
    [
      `bad..ident`,
      `unexpected token (.) on line 1, column 5; expected identifier`,
    ],
  ];
  for (const t of tt) await assertNodeThrows(Constant, ...t);
});
