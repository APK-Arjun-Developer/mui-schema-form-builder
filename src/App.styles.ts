// ─── CodeBlock ────────────────────────────────────────────────────────────────

export const codeBlockSx = {
  paper: {
    bgcolor: '#1e1e1e',
    borderRadius: 2.5,
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  titleBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    px: 2,
    py: 1.25,
    bgcolor: '#252526',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  trafficLights: { display: 'flex', gap: '5px', flexShrink: 0 },
  titleText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontFamily: '"Fira Code", "Consolas", monospace',
    flexGrow: 1,
  },
  codeBody: { p: { xs: 2, md: 2.5 }, overflow: 'auto' },
  codeText: {
    fontFamily: '"Fira Code", "JetBrains Mono", "Consolas", "Monaco", monospace',
    fontSize: 13,
    lineHeight: 1.85,
  },
} as const;

export const getCopyButtonSx = (copied: boolean) => ({
  color: copied ? '#4ade80' : 'rgba(255,255,255,0.4)',
  fontSize: 11,
  fontWeight: 600,
  minWidth: 0,
  px: 1.5,
  py: 0.4,
  borderRadius: 1,
  bgcolor: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)',
  transition: 'all 0.2s',
  flexShrink: 0,
  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: 'white' },
});

export const lineNumberStyle = {
  color: '#495162',
  userSelect: 'none' as const,
  paddingRight: 20,
  minWidth: 36,
  textAlign: 'right' as const,
  flexShrink: 0,
  display: 'inline-block',
};

// ─── Navbar ───────────────────────────────────────────────────────────────────

export const getNavbarSx = (scrolled: boolean) => ({
  transform: scrolled ? 'translateY(0)' : 'translateY(-110%)',
  bgcolor: 'rgba(10, 15, 30, 0.92)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderBottom: '1px solid rgba(255,255,255,0.07)',
  transition: 'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)',
});

export const navbarSx = {
  toolbar: { gap: 1, px: { xs: 2, md: 3 }, minHeight: { xs: 56 } },
  logo: {
    display: { xs: 'none', sm: 'block' },
    fontWeight: 800,
    fontSize: 15,
    letterSpacing: -0.4,
    background: 'linear-gradient(90deg, #60a5fa, #a78bfa)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  versionChip: {
    height: 18,
    fontSize: 10,
    fontWeight: 700,
    bgcolor: 'rgba(96,165,250,0.15)',
    color: '#93c5fd',
    border: '1px solid rgba(96,165,250,0.25)',
    mr: 'auto',
  },
  navLink: { color: 'rgba(255,255,255,0.65)', fontWeight: 600, '&:hover': { color: 'white' } },
  npmButton: {
    bgcolor: '#2563eb',
    '&:hover': { bgcolor: '#1d4ed8' },
    borderRadius: 2,
    fontWeight: 700,
  },
} as const;

// ─── Hero ──────────────────────────────────────────────────────────────────────

export const heroSx = {
  section: {
    position: 'relative',
    overflow: 'hidden',
    background: 'linear-gradient(-45deg, #0f172a, #1e3a8a, #1e1b4b, #0f172a)',
    backgroundSize: '400% 400%',
    animation: 'gradientShift 18s ease infinite',
    color: 'white',
    py: { xs: 12, md: 18 },
    textAlign: 'center',
  },
  container: { position: 'relative', zIndex: 1 },
  badgeStack: { justifyContent: 'center', flexWrap: 'wrap', gap: 1, mb: 4 },
  title: {
    mb: 2.5,
    fontWeight: 900,
    fontSize: { xs: '2.2rem', sm: '3rem', md: '4rem' },
    letterSpacing: -2,
    background: 'linear-gradient(135deg, #ffffff 0%, #93c5fd 50%, #c4b5fd 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    lineHeight: 1.1,
  },
  subtitle: {
    mb: 6,
    color: 'rgba(255,255,255,0.6)',
    maxWidth: 520,
    mx: 'auto',
    lineHeight: 1.85,
    fontSize: { xs: '1rem', md: '1.15rem' },
  },
  highlightMui: { color: '#60a5fa', fontWeight: 700 },
  highlightRhf: { color: '#f472b6', fontWeight: 700 },
  highlightZod: { color: '#34d399', fontWeight: 700 },
  installBox: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 2,
    bgcolor: 'rgba(255,255,255,0.04)',
    border: '1px solid',
    borderRadius: 2.5,
    px: { xs: 2, md: 3 },
    py: 1.5,
    mb: 5,
    maxWidth: '100%',
    animation: 'borderGlow 4s ease infinite',
  },
  installCmd: {
    fontFamily: 'monospace',
    fontSize: { xs: 13, md: 15 },
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 0.4,
    whiteSpace: 'nowrap',
  },
  ctaStack: { justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' },
  githubButton: {
    color: 'white',
    borderColor: 'rgba(255,255,255,0.3)',
    px: 4,
    borderRadius: 2.5,
    '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.07)' },
  },
  storybookButton: {
    color: '#e9d5ff',
    borderColor: 'rgba(167,139,250,0.4)',
    px: 4,
    borderRadius: 2.5,
    '&:hover': { borderColor: '#a78bfa', bgcolor: 'rgba(167,139,250,0.08)' },
  },
  demoButton: {
    px: 4,
    borderRadius: 2.5,
    bgcolor: '#2563eb',
    fontWeight: 700,
    position: 'relative',
    overflow: 'hidden',
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: '-100%',
      width: '60%',
      height: '100%',
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)',
      animation: 'shimmer 3.5s ease infinite',
    },
    '&:hover': { bgcolor: '#1d4ed8' },
  },
} as const;

export const getHeroCopySx = (copied: boolean) => ({
  color: copied ? '#34d399' : 'white',
  borderColor: copied ? '#34d399' : 'rgba(255,255,255,0.25)',
  minWidth: 76,
  flexShrink: 0,
  fontSize: 12,
  fontWeight: 600,
  transition: 'all 0.3s',
  '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.08)' },
});

export const getHeroOrbSx = (orb: {
  w: number | { xs: number; md: number };
  h: number | { xs: number; md: number };
  bg: string;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  anim: string;
}) => ({
  position: 'absolute',
  width: orb.w,
  height: orb.h,
  borderRadius: '50%',
  background: `radial-gradient(circle, ${orb.bg} 0%, transparent 70%)`,
  filter: 'blur(55px)',
  ...('top' in orb && orb.top !== undefined ? { top: orb.top } : {}),
  ...('bottom' in orb && orb.bottom !== undefined ? { bottom: orb.bottom } : {}),
  ...('left' in orb && orb.left !== undefined ? { left: orb.left } : {}),
  ...('right' in orb && orb.right !== undefined ? { right: orb.right } : {}),
  animation: orb.anim,
  pointerEvents: 'none',
});

export const getHeroBadgeSx = (chip: {
  bg: string;
  color: string;
  border: string;
  anim?: boolean;
}) => ({
  bgcolor: chip.bg,
  color: chip.color,
  fontWeight: 700,
  border: `1px solid ${chip.border}`,
  ...(chip.anim ? { animation: 'pulse 3s ease infinite' } : {}),
  '& span': { height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' },
});

// ─── Tech Stack ───────────────────────────────────────────────────────────────

export const techStackSx = {
  section: { bgcolor: '#0f172a', py: 3, borderBottom: '1px solid rgba(255,255,255,0.06)' },
  stack: {
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: { xs: 1.5, md: 3 },
  },
  builtWithLabel: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    mr: 1,
  },
  badge: {
    px: 2,
    py: 0.75,
    borderRadius: 5,
    border: '1px solid rgba(255,255,255,0.08)',
    bgcolor: 'rgba(255,255,255,0.04)',
    fontSize: 13,
    fontWeight: 600,
    transition: 'all 0.2s',
    cursor: 'default',
    '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', transform: 'translateY(-2px)' },
  },
} as const;

// ─── Features ─────────────────────────────────────────────────────────────────

export const featuresSx = {
  section: {
    py: { xs: 10, md: 14 },
    bgcolor: '#f0f4ff',
    backgroundImage: 'radial-gradient(circle, rgba(37,99,235,0.08) 1.5px, transparent 1.5px)',
    backgroundSize: '28px 28px',
  },
  sectionTitle: { textAlign: 'center', fontWeight: 800, mb: 1.5, letterSpacing: -1 },
  sectionSubtitle: { textAlign: 'center', mb: 8, maxWidth: 480, mx: 'auto', lineHeight: 1.8 },
  grid: { alignItems: 'stretch' },
  gridItem: { display: 'flex' },
  cardNumBase: {
    position: 'absolute',
    top: -14,
    right: 8,
    fontSize: 96,
    fontWeight: 900,
    lineHeight: 1,
    opacity: 0.04,
    fontFamily: 'monospace',
    userSelect: 'none',
    pointerEvents: 'none',
    transition: 'opacity 0.22s ease',
  },
  cardTitle: { fontWeight: 700, mb: 1, fontSize: '1rem' },
  cardDesc: { lineHeight: 1.8 },
} as const;

export const getFeatureCardSx = (color: string) => ({
  p: 3.5,
  height: '100%',
  position: 'relative',
  overflow: 'hidden',
  border: '1px solid rgba(0,0,0,0.07)',
  borderRadius: 3,
  bgcolor: 'white',
  '&:hover': { boxShadow: `0 20px 48px ${color}1a`, borderColor: `${color}55` },
  '&:hover .card-num': { opacity: 0.07 },
});

export const getFeatureBadgeSx = (color: string) => ({
  width: 44,
  height: 44,
  borderRadius: 2.5,
  background: `linear-gradient(135deg, ${color}1a, ${color}33)`,
  border: `1px solid ${color}2e`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  mb: 2.5,
});

export const getFeatureNumSx = (color: string) => ({
  color,
  fontWeight: 800,
  fontSize: 13,
  fontFamily: 'monospace',
});

// ─── Quick Start ──────────────────────────────────────────────────────────────

export const quickStartSx = {
  section: {
    py: { xs: 10, md: 14 },
    position: 'relative',
    overflow: 'hidden',
    bgcolor: '#fafbff',
    backgroundImage: [
      'linear-gradient(rgba(37,99,235,0.045) 1px, transparent 1px)',
      'linear-gradient(90deg, rgba(37,99,235,0.045) 1px, transparent 1px)',
    ].join(', '),
    backgroundSize: '52px 52px',
  },
  decorCode: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: { xs: 160, md: 280 },
    fontWeight: 900,
    color: 'rgba(37,99,235,0.04)',
    fontFamily: '"Fira Code", "Consolas", monospace',
    userSelect: 'none',
    pointerEvents: 'none',
    whiteSpace: 'nowrap',
    letterSpacing: -8,
    lineHeight: 1,
  },
  orbTop: {
    position: 'absolute',
    width: 500,
    height: 500,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(37,99,235,0.07) 0%, transparent 70%)',
    filter: 'blur(60px)',
    top: '-20%',
    right: '-5%',
    pointerEvents: 'none',
  },
  orbBottom: {
    position: 'absolute',
    width: 350,
    height: 350,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)',
    filter: 'blur(50px)',
    bottom: '-10%',
    left: '0%',
    pointerEvents: 'none',
  },
  container: { position: 'relative', zIndex: 1 },
  sectionTitle: { textAlign: 'center', fontWeight: 800, mb: 1.5, letterSpacing: -1 },
  sectionSubtitle: { textAlign: 'center', mb: 7, maxWidth: 420, mx: 'auto' },
  stepLabel: { fontWeight: 700, letterSpacing: 1.5, display: 'block', mb: 1.5 },
} as const;

// ─── Live Demo ────────────────────────────────────────────────────────────────

export const liveDemoSx = {
  section: {
    py: { xs: 10, md: 14 },
    background: 'linear-gradient(180deg, #f0f4ff 0%, #f8fafc 100%)',
    position: 'relative',
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    width: 600,
    height: 600,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(37,99,235,0.05) 0%, transparent 70%)',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
  },
  container: { position: 'relative', zIndex: 1 },
  sectionTitle: { textAlign: 'center', fontWeight: 800, mb: 1.5, letterSpacing: -1 },
  subtitle: { textAlign: 'center', mb: 6 },
  highlight: {
    fontWeight: 700,
    background: 'linear-gradient(90deg, #2563eb, #7c3aed)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
} as const;

// ─── Footer ───────────────────────────────────────────────────────────────────

export const footerSx = {
  section: { bgcolor: '#0f172a', py: 7, borderTop: '1px solid rgba(255,255,255,0.06)' },
  innerStack: {
    justifyContent: 'space-between',
    alignItems: { xs: 'center', sm: 'flex-start' },
    mb: 5,
  },
  brandBox: { textAlign: { xs: 'center', sm: 'left' } },
  brandName: {
    fontWeight: 800,
    fontSize: 15,
    background: 'linear-gradient(90deg, #60a5fa, #a78bfa)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    mb: 0.75,
  },
  brandMeta: { color: 'rgba(255,255,255,0.35)', lineHeight: 1.7 },
  authorLink: {
    color: '#60a5fa',
    textDecoration: 'none',
    '&:hover': { textDecoration: 'underline' },
  },
  linksStack: { alignItems: 'center' },
  link: {
    color: 'rgba(255,255,255,0.4)',
    textDecoration: 'none',
    fontSize: 14,
    transition: 'color 0.2s',
    '&:hover': { color: 'white' },
  },
  bottomDivider: { borderTop: '1px solid rgba(255,255,255,0.06)', pt: 4 },
  copyright: { color: 'rgba(255,255,255,0.2)', textAlign: 'center' },
} as const;
