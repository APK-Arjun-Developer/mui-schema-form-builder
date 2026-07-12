export interface SToken {
  text: string;
  color: string;
}

export interface FeatureItem {
  num: string;
  title: string;
  desc: string;
  color: string;
}

export interface TechStackItem {
  label: string;
  color: string;
}

export interface HeroOrb {
  w: number | { xs: number; md: number };
  h: number | { xs: number; md: number };
  bg: string;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  anim: string;
}

export interface HeroBadge {
  label: string;
  bg: string;
  color: string;
  border: string;
  anim?: boolean;
}

export interface FooterLink {
  label: string;
  href: string;
}

export interface FadeInSectionProps {
  children: import('react').ReactNode;
  delay?: number;
  sx?: object;
}

export interface CodeBlockProps {
  code: string;
  title?: string;
  showLineNumbers?: boolean;
}
