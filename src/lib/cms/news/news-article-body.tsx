import { Fragment, type ReactNode } from 'react';

import type { LexicalNode, NewsBody } from './types';

const FORMAT_BOLD = 1;
const FORMAT_ITALIC = 2;
const FORMAT_STRIKETHROUGH = 4;
const FORMAT_UNDERLINE = 8;
const FORMAT_CODE = 16;

const HEADING_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);

function renderText(node: LexicalNode): ReactNode {
  const format = node.format ?? 0;
  let element: ReactNode = node.text ?? '';

  if (format & FORMAT_CODE) {
    element = (
      <code className="bg-surface-container rounded px-1.5 py-0.5 font-mono text-[0.9em]">
        {element}
      </code>
    );
  }

  if (format & FORMAT_STRIKETHROUGH) {
    element = <s>{element}</s>;
  }

  if (format & FORMAT_UNDERLINE) {
    element = <u>{element}</u>;
  }

  if (format & FORMAT_ITALIC) {
    element = <em>{element}</em>;
  }

  if (format & FORMAT_BOLD) {
    element = <strong className="text-on-surface font-semibold">{element}</strong>;
  }

  return element;
}

function renderChildren(children: LexicalNode[] | undefined, keyPrefix: string): ReactNode[] {
  return (children ?? []).map((child, index) => (
    <Fragment key={`${keyPrefix}-${index}`}>{renderNode(child, `${keyPrefix}-${index}`)}</Fragment>
  ));
}

function renderNode(node: LexicalNode, key: string): ReactNode {
  switch (node.type) {
    case 'text':
      return renderText(node);

    case 'linebreak':
      return <br />;

    case 'paragraph':
      return (
        <p className="text-on-surface-variant leading-relaxed">
          {renderChildren(node.children, key)}
        </p>
      );

    case 'heading': {
      const Tag = (node.tag && HEADING_TAGS.has(node.tag) ? node.tag : 'h3') as 'h2' | 'h3';

      return (
        <Tag className="font-headline text-on-surface mt-10 text-2xl font-bold">
          {renderChildren(node.children, key)}
        </Tag>
      );
    }

    case 'list': {
      const ordered = node.tag === 'ol' || node.listType === 'number';
      const Tag = ordered ? 'ol' : 'ul';

      return (
        <Tag
          className={`text-on-surface-variant space-y-2 pl-6 ${ordered ? 'list-decimal' : 'list-disc'}`}
        >
          {renderChildren(node.children, key)}
        </Tag>
      );
    }

    case 'listitem':
      return <li className="leading-relaxed">{renderChildren(node.children, key)}</li>;

    case 'quote':
      return (
        <blockquote className="border-primary/30 text-on-surface-variant border-l-4 pl-5 text-lg italic">
          {renderChildren(node.children, key)}
        </blockquote>
      );

    case 'link': {
      const href = node.fields?.url ?? node.url ?? '#';
      const newTab = node.fields?.newTab ?? false;

      return (
        <a
          className="text-primary font-medium underline underline-offset-2 hover:no-underline"
          href={href}
          {...(newTab ? { target: '_blank', rel: 'noreferrer' } : {})}
        >
          {renderChildren(node.children, key)}
        </a>
      );
    }

    default:
      return node.children ? renderChildren(node.children, key) : null;
  }
}

/**
 * Renders a news article body. Accepts either a Payload Lexical document or the
 * built-in `{ plain: string[] }` fallback shape.
 */
export function NewsArticleBody({ body }: { body: NewsBody }) {
  if (!body) {
    return null;
  }

  if ('plain' in body) {
    return (
      <div className="space-y-5">
        {body.plain.map((paragraph, index) => (
          <p key={index} className="text-on-surface-variant leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>
    );
  }

  const children = body.root?.children;

  if (!children || children.length === 0) {
    return null;
  }

  return <div className="space-y-5">{renderChildren(children, 'root')}</div>;
}
