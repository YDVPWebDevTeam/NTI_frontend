import {
  BadgeCheck,
  Briefcase,
  Building2,
  FlaskConical,
  GraduationCap,
  Handshake,
  Globe,
  Lightbulb,
  Network,
  Rocket,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Users,
  UserRoundCog,
  type LucideIcon,
} from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  badge: BadgeCheck,
  briefcase: Briefcase,
  building: Building2,
  flask: FlaskConical,
  globe: Globe,
  graduation: GraduationCap,
  handshake: Handshake,
  lightbulb: Lightbulb,
  mentor: UserRoundCog,
  network: Network,
  rocket: Rocket,
  sparkles: Sparkles,
  target: Target,
  trending: TrendingUp,
  trophy: Trophy,
  users: Users,
};

/** Resolve a content icon key to a rendered lucide icon. Falls back to a badge. */
export function getMarketingIcon(key: string, className?: string) {
  const Icon = ICONS[key] ?? BadgeCheck;

  return <Icon className={className} />;
}
