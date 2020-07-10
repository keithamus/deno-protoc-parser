import { assertNode, assertNodeThrows } from "./testutil.ts";
import { Service } from "./service.ts";

Deno.test("Service", async () => {
  const tt: [string, Service][] = [
    [`service Foo {}`, new Service("Foo", [], [1, 1], [1, 14])],
  ];
  for (const t of tt) await assertNode(Service, ...t);
});

Deno.test("Service errors", async () => {
  const tt: [string, string][] = [
    [`service foo {`, "unexpected eof on line 1, column 13"],
    [
      `service _foo {}`,
      "unexpected token (_) on line 1, column 9; expected identifier",
    ],
    [
      `service 1foo {}`,
      "unexpected int (1) on line 1, column 9; expected identifier",
    ],
    [
      `service foo.bar {}`,
      "unexpected token (.) on line 1, column 12; expected identifier",
    ],
  ];
  for (const t of tt) await assertNodeThrows(Service, ...t);
});
