import type { Language, PrismTheme } from "prism-react-renderer";
import { Highlight } from "prism-react-renderer";
import { useReactiveVar } from "@apollo/client";
import { colors } from "@apollo/brand";
import { clsx } from "clsx";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { ColorTheme, colorTheme } from "../theme";
import IconCopy from "@apollo/icons/default/IconCopy.svg";
import { Button } from "./Button";
import { useMemo } from "react";

interface SyntaxHighlighterProps {
  className?: string;
  language: Language;
  code: string;
  copyable?: boolean;
}

const { code } = colors.tokens;

const getTheme = (mode: ColorTheme): PrismTheme => {
  const isDark = mode === ColorTheme.Dark;

  return {
    plain: {
      color: "currentColor",
    },
    styles: [
      {
        types: ["important", "bold"],
        style: {
          fontWeight: "bold",
        },
      },
      {
        types: ["italic"],
        style: {
          fontStyle: "italic",
        },
      },
      {
        types: ["entity"],
        style: {
          cursor: "help",
        },
      },
      {
        types: ["selector", "attr-name", "char", "builtin", "inserted"],
        style: {
          color: isDark ? code.d.dark : code.d.base,
        },
      },
      {
        types: ["comment", "prolog", "doctype", "cdata"],
        style: {
          color: isDark ? code.b.dark : code.b.base,
          fontWeight: "bold",
        },
      },
      {
        types: ["scalar", "attr-value"],
        style: {
          color: isDark ? code.c.dark : code.c.base,
        },
      },
      {
        types: ["url", "attr-value"],
        style: {
          color: isDark ? code.g.dark : code.g.base,
        },
      },
      {
        types: ["punctuation", "constant"],
        style: {
          color: isDark ? code.a.dark : code.a.base,
        },
      },
      {
        types: ["property", "tag", "boolean", "number", "symbol"],
        style: {
          color: isDark ? code.c.dark : code.c.base,
        },
      },
      {
        types: ["class-name"],
        style: {
          color: isDark ? code.a.dark : code.a.base,
        },
      },
      {
        types: ["property", "function"],
        style: {
          color: isDark ? code.d.dark : code.d.base,
        },
      },
      {
        types: ["atrule", "attr-value", "keyword"],
        style: {
          color: "inherit",
          background: "transparent",
        },
      },
      {
        types: ["atrule", "attr-value", "keyword"],
        style: {
          color: isDark ? code.b.dark : code.b.base,
        },
      },
      {
        types: ["string"],
        style: {
          color: isDark ? code.g.dark : code.g.base,
        },
      },
      {
        types: [
          "regex",
          "important",
          "variable",
          "description",
          "comment",
          "prolog",
          "doctype",
          "cdata",
        ],
        style: {
          color: isDark ? code.f.dark : code.f.base,
        },
      },
    ],
  };
};

export const CodeBlock = ({
  code,
  className,
  copyable = true,
  language,
}: SyntaxHighlighterProps) => {
  const theme = useReactiveVar(colorTheme);
  const activeTheme = useMemo(() => getTheme(theme), [theme]);

  return (
    <div
      className={clsx(
        className,
        "flex gap-1 items-start bg-secondary dark:bg-secondary-dark p-4 rounded-lg relative border border-primary dark:border-primary-dark overflow-auto text-sm [container-name:code-block] [container-type:inline-size]"
      )}
    >
      <Highlight language={language} theme={activeTheme} code={code}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => {
          return (
            <pre
              className={clsx(className, "flex-1 h-full overflow-auto")}
              style={style}
            >
              <code className="block">
                {tokens.map((line, index) => {
                  return (
                    <div key={index} {...getLineProps({ line, key: index })}>
                      {line.map((token, key) => {
                        return (
                          <span key={key} {...getTokenProps({ token, key })} />
                        );
                      })}
                    </div>
                  );
                })}
              </code>
            </pre>
          );
        }}
      </Highlight>
      {copyable && (
        <CopyToClipboard text={code}>
          <Button size="sm" variant="hidden" className="sticky top-0">
            <IconCopy className="w-4" />
            <span className="hidden [@container_code-block_(min-width:400px)]:inline">
              Copy
            </span>
          </Button>
        </CopyToClipboard>
      )}
    </div>
  );
};
