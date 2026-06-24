import React, { ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface MarkdownRendererProps {
  content: string;
}

const components = {
  h1: ({ children }: { children: ReactNode }) => (
    <h1 className="text-2xl font-bold text-primary my-4">{children}</h1>
  ),
  h2: ({ children }: { children: ReactNode }) => (
    <h2 className="text-xl font-semibold text-primary-light my-4">{children}</h2>
  ),
  h3: ({ children }: { children: ReactNode }) => (
    <h3 className="text-lg font-semibold text-primary my-3">{children}</h3>
  ),
  p: ({ children }: { children: ReactNode }) => (
    <p className="mb-4 leading-relaxed text-gray-700">{children}</p>
  ),
  blockquote: ({ children }: { children: ReactNode }) => (
    <blockquote className="border-l-4 border-accent pl-4 my-4 text-gray-600 italic bg-gray-50 p-4 rounded-r">
      {children}
    </blockquote>
  ),
  ul: ({ children }: { children: ReactNode }) => (
    <ul className="list-disc pl-6 mb-4 text-gray-700">{children}</ul>
  ),
  ol: ({ children }: { children: ReactNode }) => (
    <ol className="list-decimal pl-6 mb-4 text-gray-700">{children}</ol>
  ),
  li: ({ children }: { children: ReactNode }) => (
    <li className="mb-2">{children}</li>
  ),
  hr: () => <hr className="my-6 border-gray-200" />,
  code: ({ children, className, ...props }: any) => (
    <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono" {...props}>
      {children}
    </code>
  ),
  table: ({ children }: { children: ReactNode }) => (
    <table className="w-full border-collapse my-4">
      {children}
    </table>
  ),
  th: ({ children }: { children: ReactNode }) => (
    <th className="border border-gray-300 p-3 text-left bg-gray-50 font-semibold">{children}</th>
  ),
  td: ({ children }: { children: ReactNode }) => (
    <td className="border border-gray-300 p-3">{children}</td>
  ),
};

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={components as any}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
