import { FC, memo } from "react";
import ReactMarkdown, { Options } from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

const MemoizedReactMarkdown: FC<Options> = memo(
  ReactMarkdown,
  (prevProps, nextProps) =>
    prevProps.children === nextProps.children &&
    prevProps.className === nextProps.className
);

export function Markdown({ content }: { content: string }) {
  return (
    <div className="text-white">
      <MemoizedReactMarkdown
        className="prose prose-invert prose-p:leading-relaxed prose-pre:p-0 custom-markdown break-words"
        remarkPlugins={[
          remarkGfm,
          [remarkMath, { singleDollarTextMath: false }],
        ]}
        rehypePlugins={[rehypeKatex as any]}
        components={{
          p({ children }) {
            return <div className="mb-2 last:mb-0">{children}</div>;
          },
          code({
            inline,
            className,
            children,
            ...props
          }: {
            inline?: boolean;
            className?: string;
            children?: React.ReactNode;
          }) {
            if (inline) {
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }

            const match = /language-(\w+)/.exec(className || "");
            return (
              <pre className={`${className} mb-2`} {...props}>
                <code>{children}</code>
              </pre>
            );
          },
        }}
      >
        {content}
      </MemoizedReactMarkdown>
    </div>
  );
}
