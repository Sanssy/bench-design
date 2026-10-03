// Narrow declarations for the installed, untyped dependencies used by tooling.
declare module "jsdom" {
  export class JSDOM {
    constructor(html: string);
    window: { document: Document };
  }
}

declare module "css-tree" {
  interface CssNode {
    type: string;
    name?: string;
    value?: string | CssNode;
    loc?: { start: { line: number } } | null;
  }
  interface Declaration extends CssNode {
    type: "Declaration";
    property: string;
    value: CssNode;
  }
  export function parse(
    source: string,
    options: {
      positions: boolean;
      parseCustomProperty: boolean;
    },
  ): CssNode;
  export function generate(node: CssNode): string;
  export function walk(node: CssNode, callback: (node: CssNode) => void): void;
  export function walk(
    node: CssNode,
    options: {
      visit: "Declaration";
      enter(
        this: { rule: { prelude: CssNode } | null },
        node: Declaration,
      ): void;
    },
  ): void;
  export const lexer: {
    matchType(type: string, node: CssNode): { matched: object | null };
  };
}
