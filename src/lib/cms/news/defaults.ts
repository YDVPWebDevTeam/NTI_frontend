import type { AppLocale } from 'lib/i18n/config';

import type { NewsPageCopy } from './types';

/** Localized chrome strings for the news pages (not editable via CMS). */
export const newsPageCopy: Record<AppLocale, NewsPageCopy> = {
  en: {
    eyebrow: 'Newsroom',
    heading: 'News & Updates',
    subheading:
      "Announcements, success stories and what's happening across the NTI innovation ecosystem.",
    readMore: 'Read article',
    backToNews: 'Back to news',
    empty: 'No news yet. Check back soon for announcements and updates.',
    by: 'By',
    latest: 'Latest',
  },
  sk: {
    eyebrow: 'Novinky',
    heading: 'Novinky a aktuality',
    subheading: 'Oznámenia, príbehy úspechu a dianie v inovačnom ekosystéme NTI.',
    readMore: 'Čítať článok',
    backToNews: 'Späť na novinky',
    empty: 'Zatiaľ žiadne novinky. Čoskoro sa vráťte pre oznámenia a aktuality.',
    by: 'Autor:',
    latest: 'Najnovšie',
  },
};
