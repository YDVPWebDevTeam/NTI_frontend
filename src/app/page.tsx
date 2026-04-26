'use client';

import { t } from '@lingui/core/macro';
import Link from 'next/link';
import Image from 'next/image';
import { ROUTES } from 'lib/constants';
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  FlaskConical,
  Rocket,
  UserRoundCog,
  Users,
} from 'lucide-react';
import { LandingFooter } from 'components/layout';
import { LandingHeader } from 'components/layout';

export default function HomePage() {
  return (
    <div className="bg-surface font-body text-on-surface overflow-x-hidden antialiased">
      <LandingHeader />

      <section
        className="bg-surface relative overflow-hidden pt-32 pb-20 md:pt-48 md:pb-32"
        id="about"
      >
        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            <div className="space-y-8 lg:col-span-7">
              <span className="bg-tertiary-fixed text-on-tertiary-fixed inline-block rounded px-3 py-1 text-xs font-bold tracking-widest uppercase">
                {t`Innovation Hub`}
              </span>
              <h1 className="font-headline text-on-surface text-4xl leading-[1.1] font-extrabold tracking-tight sm:text-5xl lg:text-7xl">
                {t`Fueling the`} <span className="text-primary">{t`Precision`}</span>{' '}
                {t`of Future Tech.`}
              </h1>
              <p className="text-on-surface-variant max-w-2xl text-lg leading-relaxed md:text-xl">
                {t`Nitriansky technologický inkubátor bridges the gap between academic research and market reality. We turn bold ideas into high-performance startups.`}
              </p>
              <div className="flex flex-col gap-4 pt-4 sm:flex-row">
                <Link
                  href={ROUTES.AUTH.REGISTER_STUDENT}
                  className="primary-gradient w-full rounded-lg px-8 py-4 text-center font-bold text-white shadow-xl transition-all hover:shadow-2xl sm:w-auto"
                >
                  {t`Apply as student/team`}
                </Link>
                <Link
                  href={ROUTES.AUTH.REGISTER_COMPANY}
                  className="bg-surface-container-highest text-primary hover:bg-surface-container-high w-full rounded-lg px-8 py-4 text-center font-bold transition-all sm:w-auto"
                >
                  {t`Submit a challenge`}
                </Link>
              </div>
              <Link
                className="text-primary inline-flex items-center gap-2 font-bold hover:underline"
                href={ROUTES.HOME.LEARN_MORE}
              >
                {t`Learn more about NTI`} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="relative mt-10 lg:col-span-5 lg:mt-0">
              <div className="bg-primary-container/10 absolute -top-12 -right-12 aspect-square h-64 w-64 rounded-full blur-3xl md:h-96 md:w-96"></div>
              <div className="relative mx-auto aspect-square w-full overflow-hidden rounded-2xl border-4 border-white/50 shadow-2xl sm:w-4/5 lg:w-full">
                <Image
                  fill
                  alt={t`Modern lab environment`}
                  className="object-cover"
                  src="/images/mentor-explaining.png"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Program Overview */}
      <section className="bg-surface-container-low py-24" id="programs">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center lg:text-left">
            <h2 className="font-headline mb-4 text-4xl font-bold">
              {t`Choose Your Path to Innovation`}
            </h2>
            <div className="bg-tertiary-fixed-dim h-1.5 w-20 rounded-full"></div>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            {/* Program A */}
            <div className="bg-surface-container-lowest border-primary rounded-xl border-b-4 p-10 shadow-sm transition-shadow hover:shadow-xl">
              <div className="mb-8">
                <Rocket className="text-primary bg-primary/10 h-16 w-16 rounded-lg p-3" />
              </div>
              <h3 className="font-headline mb-4 text-2xl font-extrabold">
                {t`Program A: Venture Launch`}
              </h3>
              <p className="text-on-surface-variant mb-8 leading-relaxed">
                {t`For visionaries with their own product ideas. Transform your prototype into a market-ready company with full incubation support.`}
              </p>
              <ul className="mb-10 space-y-4">
                <li className="flex items-center gap-3 text-sm font-medium">
                  <CheckCircle2 className="text-tertiary h-5 w-5" /> {t`Seed Funding Access`}
                </li>
                <li className="flex items-center gap-3 text-sm font-medium">
                  <CheckCircle2 className="text-tertiary h-5 w-5" /> {t`1-on-1 Mentoring`}
                </li>
                <li className="flex items-center gap-3 text-sm font-medium">
                  <CheckCircle2 className="text-tertiary h-5 w-5" />{' '}
                  {t`Specialized Lab Infrastructure`}
                </li>
              </ul>
              <Link
                href={ROUTES.AUTH.REGISTER_STUDENT}
                className="border-primary text-primary hover:bg-primary block w-full rounded border-2 py-4 text-center font-bold transition-all hover:text-white"
              >
                {t`Launch Startup`}
              </Link>
            </div>
            {/* Program B */}
            <div className="bg-surface-container-lowest border-tertiary rounded-xl border-b-4 p-10 shadow-sm transition-shadow hover:shadow-xl">
              <div className="mb-8">
                <Building2 className="text-tertiary bg-tertiary/10 h-16 w-16 rounded-lg p-3" />
              </div>
              <h3 className="font-headline mb-4 text-2xl font-extrabold">
                {t`Program B: Industry Bridge`}
              </h3>
              <p className="text-on-surface-variant mb-8 leading-relaxed">
                {t`Solve real-world challenges defined by our corporate partners. Gain professional experience while building breakthrough solutions.`}
              </p>
              <ul className="mb-10 space-y-4">
                <li className="flex items-center gap-3 text-sm font-medium">
                  <CheckCircle2 className="text-tertiary h-5 w-5" />{' '}
                  {t`Real-world Corporate Practice`}
                </li>
                <li className="flex items-center gap-3 text-sm font-medium">
                  <CheckCircle2 className="text-tertiary h-5 w-5" />{' '}
                  {t`Collaboration with Enterprises`}
                </li>
                <li className="flex items-center gap-3 text-sm font-medium">
                  <CheckCircle2 className="text-tertiary h-5 w-5" />{' '}
                  {t`Career Placement Opportunities`}
                </li>
              </ul>
              <Link
                href={ROUTES.AUTH.REGISTER_COMPANY}
                className="border-tertiary text-tertiary hover:bg-tertiary block w-full rounded border-2 py-4 text-center font-bold transition-all hover:text-white"
              >
                {t`Explore Challenges`}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Strategic Pillars Bento Grid */}
      <section className="bg-surface py-24" id="infrastructure">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <p className="text-tertiary mb-2 text-xs font-bold tracking-widest uppercase">{t`Why NTI`}</p>
            <h2 className="font-headline text-4xl font-bold">{t`The Precision Engine Architecture`}</h2>
          </div>
          <div className="grid h-full grid-cols-1 gap-4 md:grid-cols-4 md:grid-rows-2">
            {/* Incubation */}
            <div className="bg-surface-container group relative flex min-h-64 flex-col justify-end overflow-hidden rounded-2xl p-8 md:col-span-2 md:row-span-2">
              <div className="absolute inset-0 opacity-10 transition-opacity group-hover:opacity-20">
                <Image
                  fill
                  alt={t`Interior space`}
                  className="object-cover"
                  src="/images/students-working.png"
                />
              </div>
              <div className="relative z-10">
                <FlaskConical className="text-primary mb-4 h-8 w-8" />
                <h4 className="mb-2 text-2xl font-bold">{t`Full-Cycle Incubation`}</h4>
                <p className="text-on-surface-variant">
                  {t`Access to premium office spaces, 3D printing labs, and legal support to scale your dream.`}
                </p>
              </div>
            </div>
            {/* Partnerships */}
            <div className="bg-surface-container-high flex items-center gap-6 rounded-2xl p-8 md:col-span-2">
              <Users className="text-tertiary h-10 w-10" />
              <div>
                <h4 className="mb-1 text-xl font-bold">{t`Global Partnerships`}</h4>
                <p className="text-on-surface-variant text-sm">
                  {t`Connecting you to university research and top European tech clusters.`}
                </p>
              </div>
            </div>
            {/* Mentoring */}
            <div className="bg-primary flex flex-col justify-between rounded-2xl p-8 text-white">
              <UserRoundCog className="h-8 w-8" />
              <div>
                <h4 className="mb-1 text-xl font-bold">{t`Mentoring`}</h4>
                <p className="text-sm text-blue-100">
                  {t`Guided by veterans from Silicon Valley to Bratislava.`}
                </p>
              </div>
            </div>
            {/* Retention */}
            <div className="bg-tertiary flex flex-col justify-between rounded-2xl p-8 text-white">
              <Building2 className="h-8 w-8" />
              <div>
                <h4 className="mb-1 text-xl font-bold">{t`Talent Retention`}</h4>
                <p className="text-sm text-cyan-100">
                  {t`Keeping bright minds in Nitra through opportunity.`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Credibility */}
      <section className="bg-surface-container-low overflow-hidden py-24" id="mentors">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-16 lg:grid-cols-3">
            <div>
              <h2 className="font-headline mb-6 text-center text-3xl font-bold lg:text-left">
                {t`Our Ecosystem`}
              </h2>
              <p className="text-on-surface-variant mb-8 text-center lg:text-left">
                {t`We collaborate with the most innovative companies and experienced mentors in the region to ensure your success.`}
              </p>
              <div className="flex flex-wrap justify-center gap-8 opacity-40 lg:justify-start">
                <div className="text-2xl font-black tracking-tighter" id="startups">
                  {t`TECHCORP`}
                </div>
                <div className="text-2xl font-black tracking-tighter">{t`UNIDATA`}</div>
                <div className="text-2xl font-black tracking-tighter" id="news">
                  {t`NITRA_LAB`}
                </div>
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:col-span-2">
              {/* Mentor Profile 1 */}
              <div className="bg-surface-container-lowest border-outline-variant/20 flex gap-4 rounded-lg border-b-2 p-6">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full">
                  <Image
                    fill
                    alt={t`Mentor`}
                    className="object-cover"
                    src="/images/business-ideas.png"
                  />
                </div>
                <div>
                  <h5 className="font-bold">{t`Ing. Marek Novak`}</h5>
                  <p className="text-tertiary mb-2 text-xs font-bold">{t`Lead Mentor / AI Systems`}</p>
                  <p className="text-on-surface-variant text-xs">
                    {t`Expert in neural networks with 15+ years in international R&D.`}
                  </p>
                </div>
              </div>
              {/* Mentor Profile 2 */}
              <div className="bg-surface-container-lowest border-outline-variant/20 flex gap-4 rounded-lg border-b-2 p-6">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full">
                  <Image
                    fill
                    alt={t`Mentor`}
                    className="object-cover"
                    src="/images/full-cycle-incubation.png"
                  />
                </div>
                <div>
                  <h5 className="font-bold">{t`Dr. Lucia Bielik`}</h5>
                  <p className="text-tertiary mb-2 text-xs font-bold">{t`Business Strategy`}</p>
                  <p className="text-on-surface-variant text-xs">
                    {t`Specializes in market entry strategies for DeepTech startups.`}
                  </p>
                </div>
              </div>
              {/* Project Highlight */}
              <div className="bg-primary-container flex items-center justify-between rounded-lg p-6 text-white md:col-span-2">
                <div className="flex items-center gap-4">
                  <BadgeCheck className="h-10 w-10 opacity-50" />
                  <div>
                    <p className="text-xs font-bold tracking-widest uppercase opacity-70">
                      {t`Recent Success`}
                    </p>
                    <h5 className="text-xl font-bold">{t`AquaSense Solutions`}</h5>
                  </div>
                </div>
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-medium">{t`Secured €500k Funding`}</p>
                  <p className="text-xs opacity-70">{t`2023 Cohort Graduate`}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-surface py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="primary-gradient relative overflow-hidden rounded-3xl p-12 text-center text-white md:p-20">
            <div className="absolute top-0 right-0 h-64 w-64 translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-3xl"></div>
            <div className="relative z-10">
              <h2 className="font-headline mb-8 text-4xl leading-tight font-extrabold tracking-tight md:text-5xl">
                {t`Ready to build the future of Nitra?`}
              </h2>
              <p className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-blue-100 md:text-xl">
                {t`Join a community of innovators, engineers, and entrepreneurs. Our next cohort starts in September.`}
              </p>
              <div className="mx-auto flex w-full flex-col justify-center gap-6 sm:w-auto sm:flex-row">
                <Link
                  href={ROUTES.AUTH.REGISTER_STUDENT}
                  className="text-primary w-full rounded-lg bg-white px-10 py-5 text-sm font-black tracking-wider uppercase shadow-xl transition-all hover:-translate-y-1 sm:w-auto"
                >
                  {t`Apply as Student`}
                </Link>
                <Link
                  href={ROUTES.AUTH.REGISTER_COMPANY}
                  className="bg-tertiary-fixed-dim text-on-tertiary-fixed w-full rounded-lg px-10 py-5 text-sm font-black tracking-wider uppercase shadow-xl transition-all hover:-translate-y-1 sm:w-auto"
                >
                  {t`Submit Challenge`}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
