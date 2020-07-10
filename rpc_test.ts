import { assertNode, assertNodeThrows } from "./testutil.ts";
import { RPC } from "./rpc.ts";

Deno.test("RPC", async () => {
  const tt: [string, RPC][] = [
    [
      `rpc Foo (Req) returns (Res) {}`,
      new RPC("Foo", { name: "Req" }, { name: "Res" }, [], [1, 1], [1, 30]),
    ],
    [
      `rpc Foo (Req) returns (Res);`,
      new RPC("Foo", { name: "Req" }, { name: "Res" }, null, [1, 1], [1, 28]),
    ],
  ];
  for (const t of tt) await assertNode(RPC, ...t);
});

Deno.test("RPC errors", async () => {
  const tt: [string, string][] = [
    [`rpc Foo (Req) returns (Res) {`, "unexpected eof on line 1, column 29"],
    [
      `rpc _foo {}`,
      "unexpected token (_) on line 1, column 5; expected identifier",
    ],
    [
      `rpc 1foo {}`,
      "unexpected int (1) on line 1, column 5; expected identifier",
    ],
    [
      `rpc foo.bar {}`,
      "unexpected token (.) on line 1, column 8; expected identifier",
    ],
  ];
  for (const t of tt) await assertNodeThrows(RPC, ...t);
});
