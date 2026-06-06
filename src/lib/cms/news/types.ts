export type NewsImage = {
  alt: string;
  url: string;
};

/** A node in a Payload Lexical rich-text tree (only the fields we render). */
export type LexicalNode = {
  type?: string;
  tag?: string;
  text?: string;
  format?: number;
  listType?: string;
  url?: string | null;
  fields?: {
    url?: string | null;
    newTab?: boolean | null;
  } | null;
  children?: LexicalNode[];
};

export type LexicalRoot = {
  root?: {
    children?: LexicalNode[];
  };
};

/** Frontend article body: either a Lexical document or plain fallback paragraphs. */
export type NewsBody = LexicalRoot | { plain: string[] } | null;

export type NewsArticle = {
  slug: string;
  title: string;
  excerpt: string;
  category: string | null;
  author: string | null;
  /** ISO date string or null. */
  publishedAt: string | null;
  coverImage: NewsImage | null;
  body: NewsBody;
};

export type PayloadNewsMedia = {
  alt?: string | null;
  url?: string | null;
};

export type PayloadNewsDoc = {
  slug?: string | null;
  title?: string | null;
  excerpt?: string | null;
  category?: string | null;
  author?: string | null;
  publishedAt?: string | null;
  coverImage?: PayloadNewsMedia | string | null;
  content?: LexicalRoot | null;
};

export type PayloadNewsListResponse = {
  docs?: PayloadNewsDoc[] | null;
};

/** Localized chrome strings for the news pages (not editable via CMS). */
export type NewsPageCopy = {
  eyebrow: string;
  heading: string;
  subheading: string;
  readMore: string;
  backToNews: string;
  empty: string;
  by: string;
  latest: string;
};
