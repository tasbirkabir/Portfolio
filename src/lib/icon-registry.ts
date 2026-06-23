import {
  Rocket, Globe, Workflow, ThumbsUp, Bot, TrendingUp, BookOpen, Megaphone,
  Search, Hammer, GraduationCap, Mail, Phone, Star, Check, ArrowUpRight,
  Quote, Sparkles, Shield, Zap, Target, Users, Award, Briefcase, Code, Cpu, Database,
  type LucideIcon,
} from "lucide-react";

/**
 * Registry mapping icon name strings → Lucide components.
 * Used by the CMS-driven views (home, about, footer, navbar) to render icons
 * that the admin picks by name in the Site Settings editor.
 */
export const ICON_REGISTRY: Record<string, LucideIcon> = {
  Rocket, Globe, Workflow, ThumbsUp, Bot, TrendingUp, BookOpen, Megaphone,
  Search, Hammer, GraduationCap, Mail, Phone, Star, Check, ArrowUpRight,
  Quote, Sparkles, Shield, Zap, Target, Users, Award, Briefcase, Code, Cpu, Database,
};

/** Resolve an icon name to a Lucide component, falling back to Sparkles. */
export function resolveIcon(name?: string): LucideIcon {
  if (!name) return Sparkles;
  return ICON_REGISTRY[name] || Sparkles;
}
