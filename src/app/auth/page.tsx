'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/src/components/shadcn/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/src/components/shadcn/card';
import { Footer } from '@/src/components/layout/footer';
import { Header } from '@/src/components/layout/header';
import {
  Users,
  Building2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Lock,
  KeyRound,
} from 'lucide-react';

const REGULAR_FEATURES = [
  'Access to Program A Frameworks',
  'Team Collaboration Tools',
  'Innovation Repository',
];

const COMPANY_FEATURES = [
  'Program B Challenge Management',
  'Enterprise Data Analytics',
  'Talent Acquisition Pipeline',
];

const SECURITY_BADGES = [
  { icon: ShieldCheck, label: 'SECURITY STANDARDS', sub: 'COMPLIANT' },
  { icon: Lock, label: 'END-TO-END', sub: 'ENCRYPTION' },
  { icon: KeyRound, label: 'MULTI-FACTOR', sub: 'AUTH PROTOCOL' },
];

export default function GatewayPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f4f0]">
      <Header />

      <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 pt-10 pb-6 sm:px-6 sm:pt-12 lg:px-12 lg:pt-14 xl:px-16">
        <div className="mb-10 sm:mb-12">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-[2px] w-8 bg-neutral-400" />
            <span className="text-[11px] font-medium tracking-[0.12em] text-neutral-500">
              IDENTITY VERIFICATION
            </span>
          </div>

          <h1 className="mb-4 text-[38px] leading-[1.07] font-semibold tracking-tight text-neutral-900 sm:text-[48px] lg:text-[56px]">
            Select Your <span className="text-blue-600 sm:block">Gateway</span>
          </h1>

          <p className="max-w-[440px] text-[14px] leading-relaxed text-neutral-500 sm:text-[15px]">
            Access the high-performance environment tailored to your institutional role. Choose a
            path to begin your technical journey.
          </p>
        </div>

        <div className="grid grid-cols-1 overflow-hidden rounded-sm border border-black/10 md:grid-cols-2">
          <Card className="flex flex-col rounded-none border-0 border-b border-black/[0.08] bg-white shadow-none md:border-r md:border-b-0">
            <CardHeader className="px-5 pt-8 pb-0 sm:px-8 sm:pt-10 lg:px-10">
              <div className="mb-6 flex items-start justify-between">
                <Users className="h-8 w-8 text-blue-600/70" strokeWidth={1.5} />
              </div>
              <h2 className="mb-1 text-[26px] font-semibold tracking-tight text-neutral-900">
                Regular User
              </h2>
              <p className="text-[10px] font-medium tracking-[0.12em] text-blue-600 uppercase">
                Students &amp; Teams
              </p>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col px-5 pt-5 pb-0 sm:px-8 lg:px-10">
              <p className="mb-7 text-[14px] leading-[1.65] text-neutral-500">
                Dedicated environment for Program A participants. Focus on end-to-end innovation,
                collaborative architectural design, and rapid prototyping within the Incubator
                ecosystem.
              </p>
              <ul className="flex-1 space-y-3">
                {REGULAR_FEATURES.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2.5 text-[13px] font-normal text-neutral-700"
                  >
                    <CheckCircle2
                      className="h-[18px] w-[18px] shrink-0 text-blue-600"
                      strokeWidth={1.8}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter className="px-5 pt-8 pb-8 sm:px-8 sm:pb-10 lg:px-10">
              <Button
                variant="outline"
                className="min-h-12 w-full cursor-pointer rounded-sm border-2 border-neutral-900 py-3 text-center text-[10px] font-semibold tracking-[0.1em] whitespace-normal text-neutral-900 transition-all duration-200 hover:bg-neutral-900 hover:text-white sm:text-[11px]"
                onClick={() => router.push('/auth/sign-up')}
              >
                CONTINUE AS REGULAR USER
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>

          {/* Company Partner */}
          <Card className="flex flex-col rounded-none border-0 bg-[#0f172a] shadow-none">
            <CardHeader className="px-5 pt-8 pb-0 sm:px-8 sm:pt-10 lg:px-10">
              <div className="mb-6 flex items-start justify-between">
                <Building2 className="h-8 w-8 text-white/40" strokeWidth={1.5} />
              </div>
              <h2 className="mb-1 text-[26px] font-semibold tracking-tight text-white">
                Company Partner
              </h2>
              <p className="text-[10px] font-medium tracking-[0.12em] text-white/40 uppercase">
                Strategic Institutions
              </p>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col px-5 pt-5 pb-0 sm:px-8 lg:px-10">
              <p className="mb-7 text-[14px] leading-[1.65] text-white/50">
                Entry point for Program B stakeholders. Manage technical challenges, oversee
                precision metrics, and interface directly with emerging talent pools through the
                Engine portal.
              </p>
              <ul className="flex-1 space-y-3">
                {COMPANY_FEATURES.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2.5 text-[13px] font-normal text-white/70"
                  >
                    <CheckCircle2
                      className="h-[18px] w-[18px] shrink-0 text-white/40"
                      strokeWidth={1.8}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter className="px-5 pt-8 pb-8 sm:px-8 sm:pb-10 lg:px-10">
              <Button
                className="min-h-12 w-full cursor-pointer rounded-sm bg-blue-800 py-3 text-center text-[10px] font-semibold tracking-[0.1em] whitespace-normal text-white transition-all duration-200 hover:bg-blue-700 sm:text-[11px]"
                onClick={() => router.push('/dashboard/company')}
              >
                CONTINUE AS COMPANY PARTNER
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>

        <p className="mt-5 text-center text-sm sm:text-base">
          Already have an account?{' '}
          <Button
            variant="link"
            onClick={() => {
              router.push('/auth/sign-in');
            }}
            className="h-auto p-0 font-medium text-blue-500"
          >
            Click
          </Button>
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 border-t border-black/[0.07] py-7 sm:grid-cols-3 sm:gap-3">
          {SECURITY_BADGES.map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex items-center justify-center gap-3 sm:justify-start">
              <Icon className="h-5 w-5 text-neutral-400" strokeWidth={1.5} />
              <div>
                <p className="text-[9px] font-semibold tracking-[0.1em] text-neutral-500 uppercase">
                  {label}
                </p>
                <p className="text-[9px] font-normal tracking-[0.08em] text-neutral-400 uppercase">
                  {sub}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
