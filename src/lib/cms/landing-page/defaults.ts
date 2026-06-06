import type { AppLocale } from 'lib/i18n/config';

import type { LandingPageContent } from './types';

export const fallbackLandingPageContent: Record<AppLocale, LandingPageContent> = {
  en: {
    hero: {
      description:
        'Nitriansky technologicky inkubator bridges the gap between academic research and market reality. We turn bold ideas into high-performance startups.',
      eyebrow: 'Innovation Hub',
      heroImage: {
        alt: 'Students working at NTI innovation hub',
        url: '/images/students.png',
      },
      learnMoreCTA: {
        href: '#programs',
        label: 'Learn more about NTI',
      },
      primaryCTA: {
        href: '/register/student',
        label: 'Apply as student/team',
      },
      secondaryCTA: {
        href: '/register/company-owner',
        label: 'Submit a challenge',
      },
      titleHighlight: 'Precision',
      titlePrefix: 'Fueling the',
      titleSuffix: 'of Future Tech.',
    },
    programs: {
      heading: 'Choose Your Path to Innovation',
      items: [
        {
          accent: 'primary',
          bulletItems: [
            'Seed Funding Access',
            '1-on-1 Mentoring',
            'Specialized Lab Infrastructure',
          ],
          cta: {
            href: '/register/student',
            label: 'Launch Startup',
          },
          description:
            'For visionaries with their own product ideas. Transform your prototype into a market-ready company with full incubation support.',
          icon: 'rocket',
          title: 'Program A: Venture Launch',
        },
        {
          accent: 'tertiary',
          bulletItems: [
            'Real-world Corporate Practice',
            'Collaboration with Enterprises',
            'Career Placement Opportunities',
          ],
          cta: {
            href: '/register/company-owner',
            label: 'Explore Challenges',
          },
          description:
            'Solve real-world challenges defined by our corporate partners. Gain professional experience while building breakthrough solutions.',
          icon: 'building',
          title: 'Program B: Industry Bridge',
        },
      ],
    },
    infrastructure: {
      cards: [
        {
          description: 'Connecting you to university research and top European tech clusters.',
          icon: 'users',
          title: 'Global Partnerships',
          tone: 'surface',
        },
        {
          description: 'Guided by veterans from Silicon Valley to Bratislava.',
          icon: 'mentor',
          title: 'Mentoring',
          tone: 'primary',
        },
        {
          description: 'Keeping bright minds in Nitra through opportunity.',
          icon: 'building',
          title: 'Talent Retention',
          tone: 'tertiary',
        },
      ],
      eyebrow: 'Why NTI',
      featuredCard: {
        description:
          'Access to premium office spaces, 3D printing labs, and legal support to scale your dream.',
        icon: 'flask',
        image: {
          alt: 'Interior space',
          url: '/images/students-working.png',
        },
        title: 'Full-Cycle Incubation',
      },
      heading: 'The Precision Engine Architecture',
    },
    ecosystem: {
      description:
        'We collaborate with the most innovative companies and experienced mentors in the region to ensure your success.',
      heading: 'Our Ecosystem',
      mentors: [
        {
          bio: 'Expert in neural networks with 15+ years in international R&D.',
          image: {
            alt: 'Mentor portrait of Marek Novak',
            url: '/images/students-clients.png',
          },
          name: 'Ing. Marek Novak',
          role: 'Lead Mentor / AI Systems',
        },
        {
          bio: 'Specializes in market entry strategies for DeepTech startups.',
          image: {
            alt: 'Mentor portrait of Lucia Bielik',
            url: '/images/students-success.png',
          },
          name: 'Dr. Lucia Bielik',
          role: 'Business Strategy',
        },
      ],
      partnerLogos: ['TECHCORP', 'UNIDATA', 'NITRA_LAB'],
      successHighlight: {
        eyebrow: 'Recent Success',
        metric: 'Secured EUR 500k Funding',
        subtext: '2023 Cohort Graduate',
        title: 'AquaSense Solutions',
      },
    },
    finalCTA: {
      description:
        'Join a community of innovators, engineers, and entrepreneurs. Our next cohort starts in September.',
      primaryCTA: {
        href: '/register/student',
        label: 'Apply as Student',
      },
      secondaryCTA: {
        href: '/register/company-owner',
        label: 'Submit Challenge',
      },
      title: 'Ready to build the future of Nitra?',
    },
  },
  sk: {
    hero: {
      description:
        'Nitriansky technologicky inkubator prepaja akademicky vyskum s realitou trhu. Pomahame menit odvazne napady na vykonne startupy.',
      eyebrow: 'Inovacne centrum',
      heroImage: {
        alt: 'Studenti v inovacnom centre NTI',
        url: '/images/students.png',
      },
      learnMoreCTA: {
        href: '#programs',
        label: 'Zistit viac o NTI',
      },
      primaryCTA: {
        href: '/register/student',
        label: 'Prihlasit sa ako student/tim',
      },
      secondaryCTA: {
        href: '/register/company-owner',
        label: 'Pridat vyzvu',
      },
      titleHighlight: 'presnost',
      titlePrefix: 'Pohaname',
      titleSuffix: 'buduce technologie.',
    },
    programs: {
      heading: 'Vyberte si svoju cestu k inovaciam',
      items: [
        {
          accent: 'primary',
          bulletItems: [
            'Pristup k seed financovaniu',
            'Individualne mentorstvo',
            'Specializovane laboratorne zazemie',
          ],
          cta: {
            href: '/register/student',
            label: 'Spustit startup',
          },
          description:
            'Pre vizionarov s vlastnym produktovym napadom. Premenime prototyp na firmu pripravenu na trh s plnou inkubacnou podporou.',
          icon: 'rocket',
          title: 'Program A: Rozbeh startupu',
        },
        {
          accent: 'tertiary',
          bulletItems: [
            'Realna firemna prax',
            'Spolupraca s podnikmi',
            'Prilezitosti na karierny rast',
          ],
          cta: {
            href: '/register/company-owner',
            label: 'Preskumat vyzvy',
          },
          description:
            'Riesite skutocne vyzvy od firemnych partnerov. Ziskate prax a vytvorite riesenia s realnym dopadom.',
          icon: 'building',
          title: 'Program B: Prepojenie s priemyslom',
        },
      ],
    },
    infrastructure: {
      cards: [
        {
          description:
            'Prepajame vas s univerzitnym vyskumom a silnymi europskymi technologickymi centrami.',
          icon: 'users',
          title: 'Globalne partnerstva',
          tone: 'surface',
        },
        {
          description: 'Pod vedenim ludi zo Silicon Valley aj z Bratislavy.',
          icon: 'mentor',
          title: 'Mentoring',
          tone: 'primary',
        },
        {
          description: 'Pomahame udrzat talent v Nitre cez skutocne prilezitosti.',
          icon: 'building',
          title: 'Udrzanie talentu',
          tone: 'tertiary',
        },
      ],
      eyebrow: 'Preco NTI',
      featuredCard: {
        description:
          'Pristup k modernym priestorom, 3D tlaci, laboratoriam aj pravnej podpore pri raste projektu.',
        icon: 'flask',
        image: {
          alt: 'Interier pracoviska',
          url: '/images/students-working.png',
        },
        title: 'Plnohodnotna inkubacia',
      },
      heading: 'Architektura presneho inovacneho zazemia',
    },
    ecosystem: {
      description:
        'Spolupracujeme s inovativnymi firmami a skusenymi mentormi v regione, aby sa vase projekty posuvali rychlejsie.',
      heading: 'Nas ekosystem',
      mentors: [
        {
          bio: 'Expert na neuronove siete s viac ako 15 rokmi medzinarodneho vyskumneho a vyvojoveho zazemia.',
          image: {
            alt: 'Portret mentora Mareka Novaka',
            url: '/images/students-clients.png',
          },
          name: 'Ing. Marek Novak',
          role: 'Hlavny mentor / AI systemy',
        },
        {
          bio: 'Specialistka na vstup na trh a rast DeepTech startupov.',
          image: {
            alt: 'Portret mentorky Lucie Bielik',
            url: '/images/students-success.png',
          },
          name: 'Dr. Lucia Bielik',
          role: 'Biznis strategia',
        },
      ],
      partnerLogos: ['TECHCORP', 'UNIDATA', 'NITRA_LAB'],
      successHighlight: {
        eyebrow: 'Nedavny uspech',
        metric: 'Ziskane financovanie 500 tisic EUR',
        subtext: 'Absolvent kohorty 2023',
        title: 'AquaSense Solutions',
      },
    },
    finalCTA: {
      description:
        'Pridajte sa ku komunite inovatorov, inzinierov a podnikatelov. Dalsia kohorta startuje v septembri.',
      primaryCTA: {
        href: '/register/student',
        label: 'Prihlasit sa ako student',
      },
      secondaryCTA: {
        href: '/register/company-owner',
        label: 'Pridat vyzvu',
      },
      title: 'Ste pripraveni budovat buducnost Nitry?',
    },
  },
};
