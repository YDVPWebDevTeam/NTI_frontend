'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { t } from '@lingui/core/macro';
import { BadgeCheck, Mail, MessageSquare, Shield, Zap } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Reveal } from 'components/landing';
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Textarea,
} from 'components/shadcn';
import { submitContact } from 'lib/api-client/contact';

/* ─── Schema ──────────────────────────────────────────────── */

const contactSchema = z.object({
  name: z
    .string()
    .min(2, t`At least 2 characters`)
    .max(100),
  email: z.email(t`Enter a valid email`),
  subject: z
    .string()
    .min(2, t`At least 2 characters`)
    .max(200),
  message: z
    .string()
    .min(10, t`At least 10 characters`)
    .max(2000),
  topic: z.string().optional(),
});

type ContactFormValues = z.infer<typeof contactSchema>;

/* ─── Topic → subject mapping ─────────────────────────────── */

function getTopicDefaults(topic: string | null): Partial<ContactFormValues> {
  if (topic === 'mentor') {
    return {
      subject: t`Becoming a mentor`,
      message: t`Hi, I would like to learn more about joining NTI as a mentor. Here is a bit about me:\n\n`,
    };
  }

  return {};
}

/* ─── Trust points ────────────────────────────────────────── */

function TrustPoints() {
  return (
    <ul className="mt-8 space-y-4">
      {[
        { icon: Mail, text: t`We read every message personally` },
        { icon: Zap, text: t`Typical response within 2 business days` },
        { icon: Shield, text: t`Your details are never shared` },
        { icon: BadgeCheck, text: t`Senior team members reply directly` },
      ].map(({ icon: Icon, text }) => (
        <li key={text} className="flex items-center gap-3">
          <span className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-xl">
            <Icon className="h-4 w-4" />
          </span>
          <span className="text-on-surface-variant text-sm font-medium">{text}</span>
        </li>
      ))}
    </ul>
  );
}

/* ─── Success state ───────────────────────────────────────── */

function SuccessCard({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <span className="bg-tertiary/10 text-tertiary mb-4 flex h-16 w-16 items-center justify-center rounded-2xl">
        <BadgeCheck className="h-8 w-8" />
      </span>
      <h3 className="font-headline text-on-surface mb-2 text-xl font-bold">{t`Message sent!`}</h3>
      <p className="text-on-surface-variant mb-6 max-w-xs text-sm leading-relaxed">
        {t`Thanks for reaching out. We'll get back to you within 2 business days.`}
      </p>
      <Button variant="outline" size="sm" onClick={onReset}>
        {t`Send another message`}
      </Button>
    </div>
  );
}

/* ─── Contact section ─────────────────────────────────────── */

export function ContactSection() {
  const searchParams = useSearchParams();
  const [submitted, setSubmitted] = useState(false);

  const topic = searchParams.get('topic');
  const topicDefaults = getTopicDefaults(topic);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: topicDefaults.subject ?? '',
      message: topicDefaults.message ?? '',
      topic: topic ?? undefined,
    },
  });

  // Re-apply defaults when the topic param changes (e.g. user clicks
  // "Become a mentor" while already on the same page).
  useEffect(() => {
    const newDefaults = getTopicDefaults(searchParams.get('topic'));

    if (newDefaults.subject) {
      form.setValue('subject', newDefaults.subject, { shouldDirty: false });
    }
    if (newDefaults.message) {
      form.setValue('message', newDefaults.message, { shouldDirty: false });
    }
    form.setValue('topic', searchParams.get('topic') ?? '');
  }, [searchParams, form]);

  const onSubmit = async (values: ContactFormValues) => {
    try {
      await submitContact(values);
      setSubmitted(true);
      toast.success(t`Your message has been sent.`);
    } catch {
      toast.error(t`Something went wrong. Please try again.`);
    }
  };

  return (
    <section
      id="contact"
      className="bg-surface-container-low border-outline-variant/20 border-t py-20 md:py-28"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-start">
          {/* ─── Left: copy ─────────────────────── */}
          <Reveal>
            <p className="text-tertiary mb-2 text-xs font-bold tracking-widest uppercase">
              {t`Get in touch`}
            </p>
            <h2 className="font-headline text-on-surface mb-4 text-3xl font-bold sm:text-4xl">
              {t`We'd love to hear from you`}
            </h2>
            <p className="text-on-surface-variant max-w-lg text-lg leading-relaxed">
              {t`Whether you want to partner with NTI, join as a mentor, submit a challenge, or just learn more — drop us a line and the right person will get back to you.`}
            </p>
            <TrustPoints />
          </Reveal>

          {/* ─── Right: form ────────────────────── */}
          <Reveal delay={120}>
            <div className="bg-surface-container-lowest rounded-3xl p-8 shadow-sm ring-1 ring-black/5 md:p-10">
              {submitted ? (
                <SuccessCard
                  onReset={() => {
                    form.reset();
                    setSubmitted(false);
                  }}
                />
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[11px] font-medium tracking-[0.1em] text-neutral-500 uppercase">
                              {t`Full name`}
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder={t`Jane Doe`}
                                autoComplete="name"
                                className="rounded-xl"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[11px] font-medium tracking-[0.1em] text-neutral-500 uppercase">
                              {t`Email`}
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="email"
                                placeholder="jane@example.com"
                                autoComplete="email"
                                className="rounded-xl"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[11px] font-medium tracking-[0.1em] text-neutral-500 uppercase">
                            {t`Subject`}
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder={t`How can we help?`}
                              className="rounded-xl"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[11px] font-medium tracking-[0.1em] text-neutral-500 uppercase">
                            {t`Message`}
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              rows={5}
                              placeholder={t`Tell us a bit about yourself and what you're interested in…`}
                              className="resize-none rounded-xl"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      disabled={form.formState.isSubmitting}
                      className="primary-gradient shadow-primary/25 w-full rounded-xl py-3 font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      {form.formState.isSubmitting ? t`Sending…` : t`Send message`}
                    </Button>
                  </form>
                </Form>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
