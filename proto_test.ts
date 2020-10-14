import { assertNode, testFile } from "./testutil.ts";
import { Proto } from "./proto.ts";
import { Syntax } from "./syntax.ts";

Deno.test("Proto", async () => {
  const tt: [string, Proto, 2 | 3][] = [
    [``, new Proto([], [1, 1], [1, 0]), 2],
    [
      `syntax = "proto3";`,
      new Proto([new Syntax(3, [1, 1], [1, 18])], [1, 1], [1, 18]),
      2,
    ],
  ];
  for (const t of tt) await assertNode(Proto, ...t);
});

Deno.test(testFile(`golang-jsonpb-test3`, 3));
Deno.test(testFile(`golang-jsonpb-test2`, 2));
Deno.test(testFile(`golang-proto3-test`, 3));
Deno.test(testFile(`golang-proto2-test`, 2));
Deno.test(testFile(`test15`, 2));
Deno.test(testFile(`test14`, 2));
Deno.test(testFile(`test13`, 2));
Deno.test(testFile(`test12`, 2));
Deno.test(testFile(`test11`, 2));
Deno.test(testFile(`test10`, 3));
Deno.test(testFile(`test9`, 2));
Deno.test(testFile(`test8`, 2));
Deno.test(testFile(`test5`, 2));
Deno.test(testFile(`test4`, 2));
Deno.test(testFile(`test3`, 2));
Deno.test(testFile(`test2`, 2));
Deno.test(testFile(`test1`, 2));
Deno.test(testFile(`rpc1`, 2));
Deno.test(testFile(`comments`, 2, { comments: true }));
Deno.test(testFile(`leadingdot`, 2));
