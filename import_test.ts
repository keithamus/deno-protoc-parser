import { assertNode, assertNodeThrows } from "./testutil.ts";
import { Import } from "./import.ts";

Deno.test("Import", async () => {
  const tt: [string, Import][] = [
    [`import "foo";`, new Import("foo", {}, [1, 1], [1, 13])],
    [`import "foo.bar";`, new Import("foo.bar", {}, [1, 1], [1, 17])],
    [`import "foo_bar";`, new Import("foo_bar", {}, [1, 1], [1, 17])],
    [
      `import weak "foo_bar";`,
      new Import("foo_bar", { weak: true }, [1, 1], [1, 22]),
    ],
    [
      `import public "other.proto";`,
      new Import("other.proto", { public: true }, [1, 1], [1, 28]),
    ],
  ];
  for (const t of tt) await assertNode(Import, ...t);
});

Deno.test("Import errors", async () => {
  const tt: [string, string][] = [
    [
      `import foo`,
      "unexpected identifier (foo) on line 1, column 8; expected string",
    ],
    [`import ""`, "unexpected eof on line 1, column 9"],
    [
      `import public weak "foo";`,
      "unexpected keyword (weak) on line 1, column 15; expected string",
    ],
    [
      `import weak public "foo";`,
      "unexpected keyword (public) on line 1, column 13; expected string",
    ],
    [
      "import `foo`;",
      "unexpected token (`) on line 1, column 8; expected string",
    ],
  ];
  for (const t of tt) await assertNodeThrows(Import, ...t);
});
