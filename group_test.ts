import { assertNode, assertNodeThrows } from "./testutil.ts";
import { Group } from "./group.ts";

Deno.test("Group", async () => {
  const tt: [string, Group, 2 | 3][] = [
    [`group Foo = 1 {}`, new Group("Foo", 1, [], {}, [1, 1], [1, 16]), 2],
    [
      `repeated group Foo = 2 {}`,
      new Group("Foo", 2, [], { repeated: true }, [1, 1], [1, 25]),
      2,
    ],
    [
      `optional group Bar = 3 {}`,
      new Group("Bar", 3, [], { optional: true }, [1, 1], [1, 25]),
      2,
    ],
    [
      `required group Baz = 4 {}`,
      new Group("Baz", 4, [], { required: true }, [1, 1], [1, 25]),
      2,
    ],
  ];
  for (const t of tt) await assertNode(Group, ...t);
});

Deno.test("Group errors", async () => {
  const tt: [string, string, 2 | 3][] = [
    [
      `group Foo = 1 {}`,
      "unexpected identifier (group) on line 1, column 1; expected identifier (Group fields are not allowed in Proto3)",
      3,
    ],
    [
      `group foo = 1 {}`,
      "unexpected identifier (foo) on line 1, column 7; expected identifier (Group names must start with a capital letter)",
      2,
    ],
    [
      `group _Foo = 1 {}`,
      "unexpected token (_) on line 1, column 7; expected identifier",
      2,
    ],
    [
      `group 1Foo = 1 {}`,
      "unexpected int (1) on line 1, column 7; expected identifier",
      2,
    ],
    [
      `group Foo.bar = 1 {}`,
      "unexpected token (.) on line 1, column 10; expected identifier",
      2,
    ],
  ];
  for (const t of tt) await assertNodeThrows(Group, ...t);
});
