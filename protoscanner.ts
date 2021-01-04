import { defaultTokens, scanComments, Scanner } from "./deps.ts";

const keywords = new Set(
  [
    "enum",
    "import",
    "map",
    "message",
    "option",
    "package",
    "public",
    "repeated",
    "returns",
    "rpc",
    "service",
    "syntax",
    "weak",
    "inf",
    "nan",
    // Proto2
    "extend",
    "required",
    "optional",
    "extensions",
  ],
);

/**
 * Options for configuring `protoScanner`
 */
export interface ProtoScannerInit {
  /**
   * Should comments be parsed or skipped?
   */
  comments?: boolean;
}

export function protoScanner(
  reader: Deno.Reader,
  { comments = false }: ProtoScannerInit = {},
): Scanner {
  return new Scanner(reader, {
    mode: defaultTokens | (comments ? scanComments : 0),
    isIdent(ch: string, i: number) {
      return (ch >= "A" && ch <= "Z") || (ch >= "a" && ch <= "z") ||
        (i > 0 && ((ch >= "0" && ch <= "9") || ch === "_" || ch === "."));
    },
    isBinary: () => false,
    isKeyword(ident: string) {
      return keywords.has(ident);
    },
    isStringDelimiter(ch: string) {
      return ch === '"' || ch === "'";
    },
  });
}
