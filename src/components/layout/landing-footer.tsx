import { t } from '@lingui/core/macro';
import Link from 'next/link';

import { ROUTES } from 'lib/constants';

import { NtiBrand } from './nti-brand';

export function LandingFooter() {
  return (
    <footer
      className="w-full border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950"
      id="contact"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-8 py-12 text-sm antialiased md:grid-cols-4">
        <div className="space-y-4">
          <NtiBrand href={ROUTES.ROOT} variant="landing" size="sm" />
          <p className="text-slate-500 dark:text-slate-400">
            {t`Driving innovation and economic growth through technology and academic collaboration.`}
          </p>
        </div>
        <div>
          <h6 className="mb-4 text-xs font-bold tracking-widest text-slate-400 uppercase">{t`Programs`}</h6>
          <ul className="space-y-2">
            <li>
              <Link
                className="text-slate-500 transition-colors hover:text-blue-700 dark:text-slate-400 dark:hover:text-cyan-300"
                href={ROUTES.HOME.STARTUPS}
              >
                {t`Startups`}
              </Link>
            </li>
            <li>
              <Link
                className="text-slate-500 transition-colors hover:text-blue-700 dark:text-slate-400 dark:hover:text-cyan-300"
                href={ROUTES.HOME.PROGRAMS}
              >
                {t`Corporate Challenges`}
              </Link>
            </li>
            <li>
              <Link
                className="text-slate-500 transition-colors hover:text-blue-700 dark:text-slate-400 dark:hover:text-cyan-300"
                href={ROUTES.HOME.MENTORS}
              >
                {t`Mentoring`}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h6 className="mb-4 text-xs font-bold tracking-widest text-slate-400 uppercase">{t`Legal`}</h6>
          <ul className="space-y-2">
            <li>
              <Link
                className="text-slate-500 transition-colors hover:text-blue-700 dark:text-slate-400 dark:hover:text-cyan-300"
                href={ROUTES.PRIVACY_POLICY}
              >
                {t`Privacy Policy`}
              </Link>
            </li>
            <li>
              <Link
                className="text-slate-500 transition-colors hover:text-blue-700 dark:text-slate-400 dark:hover:text-cyan-300"
                href={ROUTES.TERMS_OF_SERVICE}
              >
                {t`Terms of Service`}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h6 className="mb-4 text-xs font-bold tracking-widest text-slate-400 uppercase">{t`Connect`}</h6>
          <ul className="space-y-2">
            <li>
              <Link
                className="text-slate-500 transition-colors hover:text-blue-700 dark:text-slate-400 dark:hover:text-cyan-300"
                href={ROUTES.HOME.CONTACT}
              >
                {t`Contact Us`}
              </Link>
            </li>
            <li>
              <Link
                className="text-slate-500 transition-colors hover:text-blue-700 dark:text-slate-400 dark:hover:text-cyan-300"
                href={ROUTES.SOCIAL.LINKEDIN}
              >
                {t`LinkedIn`}
              </Link>
            </li>
            <li>
              <Link
                className="text-slate-500 transition-colors hover:text-blue-700 dark:text-slate-400 dark:hover:text-cyan-300"
                href={ROUTES.SOCIAL.TWITTER}
              >
                {t`Twitter`}
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-200 dark:border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-8 py-6 text-center">
          <Link
            className="text-sm font-medium text-slate-700 transition-colors hover:text-blue-700 dark:text-slate-300 dark:hover:text-cyan-300"
            href={ROUTES.ADMIN.LOGIN}
          >
            {t`Admin Login`}
          </Link>
          <span className="text-xs text-slate-500 dark:text-slate-400">{t`© 2026 NTI. All rights reserved.`}</span>
        </div>
      </div>
    </footer>
  );
}
