import { Scanner, Token, nextTokenIs, TokenError } from "./deps.ts";
import { ParseNode } from "./parsenode.ts";
import { Comment } from "./comment.ts";

export async function expectSimpleIdent(
  scanner: Scanner,
  advance = true,
): Promise<string> {
  const str = advance
    ? await nextTokenIs(scanner, Token.identifier)
    : scanner.contents;
  const i = str.indexOf(".");
  if (i >= 0) {
    scanner.contents = ".";
    scanner.startPos[1] += i;
    throw new TokenError(scanner, Token.token, Token.identifier);
  }
  return str;
}

export async function expectFullIdent(
  scanner: Scanner,
  advance = true,
): Promise<string> {
  const str = advance
    ? await nextTokenIs(scanner, Token.identifier)
    : scanner.contents;
  const i = str.indexOf("..");
  if (i >= 0) {
    scanner.contents = ".";
    scanner.startPos[1] += i + 1;
    throw new TokenError(scanner, Token.token, Token.identifier);
  }
  return str;
}

interface Commentable {
  comments: Comment[];
}
interface Body {
  body: ParseNode[] | null;
}

export function assignComments(node: ParseNode & Body & Commentable): void {
  if (node.comments.length && node.body) {
    const retainedComments = [];
    for (const comment of node.comments) {
      const childNode: ParseNode | void = node.body.find((node) =>
        node.start[0] === comment.end[0] + 1
      );
      if (childNode && "comments" in childNode) {
        (childNode as ParseNode & Commentable).comments.push(comment);
      } else {
        retainedComments.push(comment);
      }
    }
    node.comments = retainedComments;
  }
}

export function indent(str: string, spaces = 2): string {
  return str.split("\n").map((line) => line.padStart(line.length + spaces, " "))
    .join("\n");
}
