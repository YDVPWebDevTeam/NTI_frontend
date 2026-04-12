'use client';

import { t } from '@lingui/core/macro';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  KeyRound,
  Lock,
  ShieldCheck,
  type LucideIcon,
  Users,
} from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/src/components/shadcn/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/src/components/shadcn/card';
import { ROUTES } from '@/src/lib/constants';
import { cn } from '@/src/lib/utils';

type GatewayCardTheme = 'light' | 'dark';

type GatewayCardConfig = {
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  href: string;
  ctaLabel: string;
  icon: LucideIcon;
  theme: GatewayCardTheme;
};

type SecurityBadge = {
  icon: LucideIcon;
  label: string;
  sublabel: string;
};

function GatewayCard({
  title,
  subtitle,
  description,
  features,
  href,
  ctaLabel,
  icon: Icon,
  theme,
}: GatewayCardConfig) {
  const isDark = theme === 'dark';

  return (
    <Card
      className={cn(
        'flex flex-col rounded-none border-0 shadow-none',
        isDark ? 'bg-[#0f172a]' : 'border-b border-black/[0.08] bg-white md:border-r md:border-b-0',
      )}
    >
      <CardHeader className="px-5 pt-8 pb-0 sm:px-8 sm:pt-10 lg:px-10">
        <div className="mb-6 flex items-start justify-between">
          <Icon
            className={cn('h-8 w-8', isDark ? 'text-white/40' : 'text-blue-600/70')}
            strokeWidth={1.5}
          />
        </div>

        <h2
          className={cn(
            'mb-1 text-[26px] font-semibold tracking-tight',
            isDark ? 'text-white' : 'text-neutral-900',
          )}
        >
          {title}
        </h2>

        <p
          className={cn(
            'text-[10px] font-medium tracking-[0.12em] uppercase',
            isDark ? 'text-white/40' : 'text-blue-600',
          )}
        >
          {subtitle}
        </p>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col px-5 pt-5 pb-0 sm:px-8 lg:px-10">
        <p
          className={cn(
            'mb-7 text-[14px] leading-[1.65]',
            isDark ? 'text-white/50' : 'text-neutral-500',
          )}
        >
          {description}
        </p>

        <ul className="flex-1 space-y-3">
          {features.map((feature) => (
            <li
              key={feature}
              className={cn(
                'flex items-center gap-2.5 text-[13px] font-normal',
                isDark ? 'text-white/70' : 'text-neutral-700',
              )}
            >
              <CheckCircle2
                className={cn(
                  'h-[18px] w-[18px] shrink-0',
                  isDark ? 'text-white/40' : 'text-blue-600',
                )}
                strokeWidth={1.8}
              />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="px-5 pt-8 pb-8 sm:px-8 sm:pb-10 lg:px-10">
        <Button
          asChild
          variant={isDark ? 'default' : 'outline'}
          className={cn(
            'min-h-12 w-full rounded-sm py-3 text-center text-[10px] font-semibold tracking-[0.1em] whitespace-normal transition-all duration-200 sm:text-[11px]',
            isDark
              ? 'bg-blue-800 text-white hover:bg-blue-700'
              : 'border-2 border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white',
          )}
        >
          <Link href={href}>
            {ctaLabel.toUpperCase()}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function GatewayPage() {
  const gateways: GatewayCardConfig[] = [
    {
      title: t`Regular User`,
      subtitle: t`Students & Teams`,
      description: t`Dedicated environment for Program A participants. Focus on end-to-end innovation, collaborative architectural design, and rapid prototyping within the Incubator ecosystem.`,
      features: [
        t`Access to Program A Frameworks`,
        t`Team Collaboration Tools`,
        t`Innovation Repository`,
      ],
      href: ROUTES.AUTH.REGISTER_STUDENT,
      ctaLabel: t`Continue as Regular User`,
      icon: Users,
      theme: 'light',
    },
    {
      title: t`Company Partner`,
      subtitle: t`Strategic Institutions`,
      description: t`Entry point for Program B stakeholders. Manage technical challenges, oversee precision metrics, and interface directly with emerging talent pools through the Engine portal.`,
      features: [
        t`Program B Challenge Management`,
        t`Enterprise Data Analytics`,
        t`Talent Acquisition Pipeline`,
      ],
      href: ROUTES.AUTH.REGISTER_COMPANY,
      ctaLabel: t`Continue as Company Partner`,
      icon: Building2,
      theme: 'dark',
    },
  ];

  const securityBadges: SecurityBadge[] = [
    { icon: ShieldCheck, label: t`SECURITY STANDARDS`, sublabel: t`COMPLIANT` },
    { icon: Lock, label: t`END-TO-END`, sublabel: t`ENCRYPTION` },
    { icon: KeyRound, label: t`MULTI-FACTOR`, sublabel: t`AUTH PROTOCOL` },
  ];

  return (
    <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 pt-10 pb-6 sm:px-6 sm:pt-12 lg:px-12 lg:pt-14 xl:px-16">
      <section className="mb-10 sm:mb-12">
        <div className="mb-4 flex items-center gap-3">
          <div className="h-[2px] w-8 bg-neutral-400" />
          <span className="text-[11px] font-medium tracking-[0.12em] text-neutral-500">
            {t`IDENTITY VERIFICATION`}
          </span>
        </div>

        <h1 className="mb-4 text-[38px] leading-[1.07] font-semibold tracking-tight text-neutral-900 sm:text-[48px] lg:text-[56px]">
          {t`Select Your`} <span className="text-blue-600 sm:block">{t`Gateway`}</span>
        </h1>

        <p className="max-w-[440px] text-[14px] leading-relaxed text-neutral-500 sm:text-[15px]">
          {t`Access the high-performance environment tailored to your institutional role. Choose a path to begin your technical journey.`}
        </p>
      </section>

      <section className="grid grid-cols-1 overflow-hidden rounded-sm border border-black/10 md:grid-cols-2">
        {gateways.map((gateway) => (
          <GatewayCard key={gateway.title} {...gateway} />
        ))}
      </section>

      <p className="mt-5 text-center text-sm sm:text-base">
        {t`Already have an account?`}{' '}
        <Button asChild variant="link" className="h-auto p-0 font-medium text-blue-500">
          <Link href={ROUTES.AUTH.LOGIN}>{t`Log in`}</Link>
        </Button>
      </p>

      <section className="mt-8 grid grid-cols-1 gap-4 border-t border-black/[0.07] py-7 sm:grid-cols-3 sm:gap-3">
        {securityBadges.map(({ icon: Icon, label, sublabel }) => (
          <div key={label} className="flex items-center justify-center gap-3 sm:justify-start">
            <Icon className="h-5 w-5 text-neutral-400" strokeWidth={1.5} />
            <div>
              <p className="text-[9px] font-semibold tracking-[0.1em] text-neutral-500 uppercase">
                {label}
              </p>
              <p className="text-[9px] font-normal tracking-[0.08em] text-neutral-400 uppercase">
                {sublabel}
              </p>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
