export type CmsLink = {
  href: string;
  label: string;
};

export type CmsImage = {
  alt: string;
  url: string;
};

export type ProgramAccent = 'primary' | 'tertiary';
export type CardTone = 'surface' | 'primary' | 'tertiary';
export type IconKey = 'badge' | 'building' | 'flask' | 'mentor' | 'rocket' | 'users';

export type LandingPageContent = {
  ecosystem: {
    description: string;
    heading: string;
    mentors: Array<{
      bio: string;
      image: CmsImage;
      name: string;
      role: string;
    }>;
    partnerLogos: string[];
    successHighlight: {
      eyebrow: string;
      metric: string;
      subtext: string;
      title: string;
    };
  };
  finalCTA: {
    description: string;
    primaryCTA: CmsLink;
    secondaryCTA: CmsLink;
    title: string;
  };
  hero: {
    description: string;
    eyebrow: string;
    heroImage: CmsImage;
    learnMoreCTA: CmsLink;
    primaryCTA: CmsLink;
    secondaryCTA: CmsLink;
    titleHighlight: string;
    titlePrefix: string;
    titleSuffix: string;
  };
  infrastructure: {
    cards: Array<{
      description: string;
      icon: IconKey;
      title: string;
      tone: CardTone;
    }>;
    eyebrow: string;
    featuredCard: {
      description: string;
      icon: IconKey;
      image: CmsImage;
      title: string;
    };
    heading: string;
  };
  programs: {
    heading: string;
    items: Array<{
      accent: ProgramAccent;
      bulletItems: string[];
      cta: CmsLink;
      description: string;
      icon: IconKey;
      title: string;
    }>;
  };
};

export type PayloadMedia = {
  alt?: string | null;
  url?: string | null;
};

export type PayloadLocalizedLink = {
  href?: string | null;
  label?: string | null;
};

export type PayloadLandingPage = {
  ecosystem?: {
    description?: string | null;
    heading?: string | null;
    mentors?: Array<{
      bio?: string | null;
      image?: PayloadMedia | null;
      name?: string | null;
      role?: string | null;
    }> | null;
    partnerLogos?: Array<{
      label?: string | null;
    }> | null;
    successHighlight?: {
      eyebrow?: string | null;
      metric?: string | null;
      subtext?: string | null;
      title?: string | null;
    } | null;
  } | null;
  finalCTA?: {
    description?: string | null;
    primaryCTA?: PayloadLocalizedLink | null;
    secondaryCTA?: PayloadLocalizedLink | null;
    title?: string | null;
  } | null;
  hero?: {
    description?: string | null;
    eyebrow?: string | null;
    heroImage?: PayloadMedia | null;
    learnMoreCTA?: PayloadLocalizedLink | null;
    primaryCTA?: PayloadLocalizedLink | null;
    secondaryCTA?: PayloadLocalizedLink | null;
    titleHighlight?: string | null;
    titlePrefix?: string | null;
    titleSuffix?: string | null;
  } | null;
  infrastructure?: {
    cards?: Array<{
      description?: string | null;
      icon?: IconKey | null;
      title?: string | null;
      tone?: CardTone | null;
    }> | null;
    eyebrow?: string | null;
    featuredCard?: {
      description?: string | null;
      icon?: IconKey | null;
      image?: PayloadMedia | null;
      title?: string | null;
    } | null;
    heading?: string | null;
  } | null;
  programs?: {
    heading?: string | null;
    items?: Array<{
      accent?: ProgramAccent | null;
      bulletItems?: Array<{
        label?: string | null;
      }> | null;
      cta?: PayloadLocalizedLink | null;
      description?: string | null;
      icon?: IconKey | null;
      title?: string | null;
    }> | null;
  } | null;
};
