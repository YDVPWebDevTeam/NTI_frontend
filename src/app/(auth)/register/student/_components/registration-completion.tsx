import { t } from '@lingui/core/macro';
import { ArrowRight, PartyPopper, Sparkles, Star } from 'lucide-react';
import Link from 'next/link';

import { Button } from 'components/shadcn';
import { ROUTES } from 'lib/constants/routes';

type RegistrationCompletionProps = {
  onFinish: () => void;
};

export function RegistrationCompletion({ onFinish }: RegistrationCompletionProps) {
  return (
    <div className="animate-in fade-in zoom-in slide-in-from-bottom-8 relative overflow-hidden rounded-3xl border border-black/5 bg-white p-6 shadow-xl duration-700 sm:p-10">
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
        <div className="absolute -top-24 -right-24 h-64 w-64 animate-pulse rounded-full bg-[#1e58d5]/15 blur-3xl" />
        <div
          className="absolute -bottom-24 -left-24 h-64 w-64 animate-pulse rounded-full bg-[#041d67]/10 blur-3xl"
          style={{ animationDelay: '1s' }}
        />

        <Star
          className="absolute top-8 left-12 h-6 w-6 animate-spin text-yellow-400 opacity-60"
          style={{ animationDuration: '3s' }}
        />
        <Sparkles className="absolute top-16 right-16 h-8 w-8 animate-pulse text-[#1e58d5] opacity-40" />
        <Star
          className="absolute bottom-16 left-1/4 h-5 w-5 animate-bounce text-yellow-500 opacity-50"
          style={{ animationDelay: '0.5s' }}
        />
        <Sparkles
          className="absolute right-1/4 bottom-12 h-10 w-10 animate-spin text-blue-400 opacity-30"
          style={{ animationDuration: '5s' }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <div className="group mx-auto flex h-24 w-24 rotate-3 items-center justify-center rounded-3xl border border-[#1e58d5]/20 bg-linear-to-br from-[#1e58d5]/5 to-[#1e58d5]/20 shadow-sm transition-transform duration-300 hover:scale-110 hover:rotate-12">
          <div className="animate-bounce">
            <PartyPopper className="h-12 w-12 -rotate-3 text-[#1e58d5] transition-transform duration-300 group-hover:rotate-0" />
          </div>
        </div>

        <div className="mt-8 inline-flex animate-pulse items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-semibold tracking-[0.24em] text-neutral-600 uppercase shadow-md">
          <Sparkles className="h-3.5 w-3.5 text-[#1e58d5]" />
          {t`100% Complete`}
        </div>

        <h3 className="mt-6 text-4xl leading-tight font-bold tracking-tight text-[#0c1a4f] sm:text-5xl">
          {t`Phew! You survived.`}
        </h3>
        <p className="mt-5 text-base leading-relaxed text-neutral-600 sm:text-lg">
          {t`That was a lot of typing, but you made it! Your profile is officially sparkling clean and ready to go. Now, don't suffer alone—invite your colleagues to share the joy of filling out this form!`}
        </p>

        <div className="mt-10 grid gap-4 text-left sm:grid-cols-3">
          {[
            { title: t`Form Conquered`, desc: t`You survived the boss fight` },
            { title: t`Profile Nailed`, desc: t`Looking absolutely stellar` },
            { title: t`Friends Next`, desc: t`Time to invite colleagues` },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-black/5 bg-neutral-50 p-5 shadow-sm transition-transform hover:-translate-y-1"
            >
              <p className="font-semibold text-[#0c1a4f]">{item.title}</p>
              <p className="mt-1 text-sm text-neutral-500">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            asChild
            type="button"
            onClick={onFinish}
            className="h-14 rounded-full bg-[#1e58d5] px-8 text-[12px] font-bold tracking-[0.15em] text-white shadow-md transition-all hover:bg-[#245fdc] hover:shadow-lg"
          >
            <Link href={ROUTES.ONBOARDING_INVITES}>
              {t`INVITE COLLEAGUES`}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
