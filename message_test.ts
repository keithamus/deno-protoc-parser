import { assertNode, assertNodeThrows } from "./testutil.ts";
import { Message } from "./message.ts";

Deno.test("Message", async () => {
  const tt: [string, Message][] = [
    [`message foo {}`, new Message("foo", [], [1, 1], [1, 14])],
    [`message foo.bar {}`, new Message("foo.bar", [], [1, 1], [1, 18])],
    [`message foo_bar {}`, new Message("foo_bar", [], [1, 1], [1, 18])],
  ];
  for (const t of tt) await assertNode(Message, ...t);
});

Deno.test("Message errors", async () => {
  const tt: [string, string][] = [
    [`message foo {`, "unexpected eof on line 1, column 13"],
    [
      `message _foo {}`,
      "unexpected token (_) on line 1, column 9; expected identifier",
    ],
    [
      `message 1foo {}`,
      "unexpected int (1) on line 1, column 9; expected identifier",
    ],
    [
      `message foo..bar {}`,
      "unexpected token (.) on line 1, column 13; expected identifier",
    ],
  ];
  for (const t of tt) await assertNodeThrows(Message, ...t);
});
