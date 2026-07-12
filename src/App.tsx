import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  createTheme,
  ThemeProvider,
  CssBaseline,
  GlobalStyles,
  AppBar,
  Toolbar,
  Box,
  Container,
  Typography,
  Button,
  Chip,
  Grid,
  Paper,
  Stack,
} from '@mui/material';
import { ExampleForm } from './example/ExampleForm';
import pkg from '../package.json';
import type { SToken, FadeInSectionProps, CodeBlockProps } from './App.types';
import {
  codeBlockSx,
  getCopyButtonSx,
  lineNumberStyle,
  getNavbarSx,
  navbarSx,
  heroSx,
  getHeroCopySx,
  getHeroOrbSx,
  getHeroBadgeSx,
  techStackSx,
  featuresSx,
  getFeatureCardSx,
  getFeatureBadgeSx,
  getFeatureNumSx,
  quickStartSx,
  liveDemoSx,
  footerSx,
} from './App.styles';

// ─── Theme ────────────────────────────────────────────────────────────────────

const theme = createTheme({
  palette: {
    primary: { main: '#2563eb' },
    secondary: { main: '#7c3aed' },
    background: { default: '#f8fafc' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        },
      },
    },
  },
});

// ─── Global keyframes ─────────────────────────────────────────────────────────

const globalStyles = (
  <GlobalStyles
    styles={{
      '@keyframes gradientShift': {
        '0%': { backgroundPosition: '0% 50%' },
        '50%': { backgroundPosition: '100% 50%' },
        '100%': { backgroundPosition: '0% 50%' },
      },
      '@keyframes float1': {
        '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
        '40%': { transform: 'translate(40px, -40px) scale(1.06)' },
        '70%': { transform: 'translate(-20px, 20px) scale(0.96)' },
      },
      '@keyframes float2': {
        '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
        '35%': { transform: 'translate(-30px, 30px) scale(1.04)' },
        '65%': { transform: 'translate(20px, -20px) scale(0.97)' },
      },
      '@keyframes pulse': {
        '0%, 100%': { opacity: 1 },
        '50%': { opacity: 0.6 },
      },
      '@keyframes shimmer': {
        '0%': { left: '-100%' },
        '100%': { left: '200%' },
      },
      '@keyframes borderGlow': {
        '0%, 100%': { borderColor: 'rgba(255,255,255,0.12)', boxShadow: 'none' },
        '50%': {
          borderColor: 'rgba(96,165,250,0.5)',
          boxShadow: '0 0 24px rgba(96,165,250,0.15)',
        },
      },
      html: { scrollBehavior: 'smooth' },
    }}
  />
);

// ─── FadeInSection ────────────────────────────────────────────────────────────

const FadeInSection = React.memo(({ children, delay = 0, sx }: FadeInSectionProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.1 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <Box
      ref={ref}
      sx={[
        {
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(28px)',
          transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      {children}
    </Box>
  );
});
FadeInSection.displayName = 'FadeInSection';

// ─── Syntax tokenizer (VS Code Dark+ palette) ─────────────────────────────────

const TC = {
  keyword: '#c586c0',
  decl: '#569cd6',
  string: '#ce9178',
  type: '#4ec9b0',
  fn: '#dcdcaa',
  prop: '#9cdcfe',
  number: '#b5cea8',
  bool: '#569cd6',
  comment: '#6a9955',
  plain: '#d4d4d4',
  dim: '#6b7280',
};

const TOKEN_PATTERNS: Array<[RegExp, string]> = [
  [/^(['"`])(?:(?!\1)[^\\]|\\.)*\1/, TC.string],
  [/^\b(import|export|from|return|default|async|await|of|in|typeof|instanceof)\b/, TC.keyword],
  [/^\b(const|let|var|function|class|type|interface|enum|new|extends|implements)\b/, TC.decl],
  [/^\b(true|false|null|undefined|void)\b/, TC.bool],
  [/^\b\d+(\.\d+)?\b/, TC.number],
  [/^[A-Z][A-Za-z0-9_]*/, TC.type],
  [/^[a-zA-Z_$][a-zA-Z0-9_$]*(?=\s*\()/, TC.fn],
  [/^[a-zA-Z_$][a-zA-Z0-9_$]*(?=\s*:)/, TC.prop],
  [/^[a-zA-Z_$][a-zA-Z0-9_$]*/, TC.plain],
  [/^[<>=!&|+\-*/%^~?:;.,{}[\]()\\]/, TC.plain],
  [/^\s+/, TC.plain],
  [/^./, TC.dim],
];

function tokenizeLine(line: string): SToken[] {
  if (line.trimStart().startsWith('//')) return [{ text: line, color: TC.comment }];

  const tokens: SToken[] = [];
  let rem = line;

  while (rem.length > 0) {
    let matched = false;
    for (const [re, color] of TOKEN_PATTERNS) {
      const m = rem.match(re);
      if (m) {
        tokens.push({ text: m[0], color });
        rem = rem.slice(m[0].length);
        matched = true;
        break;
      }
    }
    if (!matched) {
      tokens.push({ text: rem[0], color: TC.dim });
      rem = rem.slice(1);
    }
  }

  return tokens;
}

// ─── CodeBlock ────────────────────────────────────────────────────────────────

const CodeBlock = React.memo(({ code, title, showLineNumbers = false }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable (non-HTTPS or permission denied)
    }
  }, [code]);

  const lines = code.split('\n');

  return (
    <Paper elevation={0} sx={codeBlockSx.paper}>
      {/* Title bar */}
      <Box sx={codeBlockSx.titleBar}>
        {/* macOS traffic-light dots */}
        <Box sx={codeBlockSx.trafficLights}>
          {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
            <Box key={c} sx={{ width: 11, height: 11, borderRadius: '50%', bgcolor: c }} />
          ))}
        </Box>

        {title && <Typography sx={codeBlockSx.titleText}>{title}</Typography>}

        <Button size="small" onClick={handleCopy} sx={getCopyButtonSx(copied)}>
          {copied ? '✓ Copied' : 'Copy'}
        </Button>
      </Box>

      {/* Code body */}
      <Box sx={codeBlockSx.codeBody}>
        <Box sx={codeBlockSx.codeText}>
          {lines.map((line, i) => (
            <div key={i} style={{ display: 'flex' }}>
              {showLineNumbers && <span style={lineNumberStyle}>{i + 1}</span>}
              <span style={{ whiteSpace: 'pre', flex: 1 }}>
                {tokenizeLine(line).map((t, j) => (
                  <span key={j} style={{ color: t.color }}>
                    {t.text}
                  </span>
                ))}
              </span>
            </div>
          ))}
        </Box>
      </Box>
    </Paper>
  );
});
CodeBlock.displayName = 'CodeBlock';

// ─── Constants ────────────────────────────────────────────────────────────────

const INSTALL_CMD = 'npm install mui-schema-form-builder';

const STORYBOOK_URL = import.meta.env.DEV
  ? 'http://localhost:6006'
  : 'https://apk-arjun-developer.github.io/mui-schema-form-builder/storybook/';

const CODE_EXAMPLE = `import { FormBuilder, FIELD_TYPE } from 'mui-schema-form-builder';
import { z } from 'zod';

const schema = z.object({
  name:    z.string().min(2),
  country: z.string().min(1),
  skills:  z.array(z.string()).min(1),
  agree:   z.boolean().refine(v => v, 'Must agree'),
});

const fields = [
  { name: 'name',    label: 'Full Name', type: FIELD_TYPE.TEXT,
    required: true, section: 'Profile' },
  { name: 'country', label: 'Country',   type: FIELD_TYPE.SELECT,
    section: 'Profile',
    options: [{ label: 'US', value: 'us' }, { label: 'CA', value: 'ca' }] },
  { name: 'skills',  label: 'Skills',    type: FIELD_TYPE.CHECKBOX,
    section: 'Skills',
    options: [{ label: 'React', value: 'react' },
              { label: 'TypeScript', value: 'ts' }] },
  { name: 'agree',   label: 'I accept the terms', type: FIELD_TYPE.CHECKBOX,
    section: 'Terms' },
];

export default function MyForm() {
  return (
    <FormBuilder
      fields={fields}
      schema={schema}
      onSubmit={(data) => console.log(data)}
      onReset={() => {}}
    />
  );
}`;

const features = [
  {
    num: '01',
    title: 'Schema Driven',
    desc: 'Define your entire form from a JSON field config. No per-field JSX boilerplate.',
    color: '#2563eb',
  },
  {
    num: '02',
    title: 'Type-Safe with Zod',
    desc: 'Pass any Zod schema — validation, inference, and error messages are all automatic. Yup and Valibot resolvers also supported.',
    color: '#7c3aed',
  },
  {
    num: '03',
    title: 'Multi-step Wizard',
    desc: 'FormWizard adds a MUI Stepper with per-step validation, Back/Next navigation, and shared form state.',
    color: '#0891b2',
  },
  {
    num: '04',
    title: 'Read-only Display',
    desc: 'Pass readOnly to switch any form into a formatted display view — perfect for review and confirmation screens.',
    color: '#059669',
  },
  {
    num: '05',
    title: 'Array & Nested Fields',
    desc: 'FIELD_TYPE.ARRAY renders dynamic lists via useFieldArray. Dot-notation names (address.city) handle nested objects automatically.',
    color: '#d97706',
  },
  {
    num: '06',
    title: 'Extensible Registry',
    desc: 'registerFieldType() plugs in any custom component. createDatePickerInput() wires up MUI DatePicker as an optional peer dep.',
    color: '#dc2626',
  },
  {
    num: '07',
    title: 'Conditional Fields',
    desc: 'Show or hide fields at runtime with a simple visibleIf predicate. Only fields with conditions subscribe to form-wide state.',
    color: '#7e22ce',
  },
  {
    num: '08',
    title: 'Async Autocomplete',
    desc: 'Pass a fetchOptions function — debounced search with loading state built in.',
    color: '#0e7490',
  },
  {
    num: '09',
    title: 'i18n Labels',
    desc: 'Override built-in UI strings via the labels prop — no extra i18n library required.',
    color: '#15803d',
  },
  {
    num: '10',
    title: 'Filter Form',
    desc: 'FilterForm turns any field config into a reactive filter bar. onChange fires on every keystroke — no submit button, no Zod schema required.',
    color: '#0f766e',
  },
  {
    num: '11',
    title: 'Combo Input',
    desc: 'FIELD_TYPE.COMBO_INPUT fuses a Select dropdown with a text/number/search input into a single compound field — perfect for phone, currency, search-with-category, and unit inputs.',
    color: '#b45309',
  },
  {
    num: '12',
    title: 'Search Input',
    desc: 'FIELD_TYPE.SEARCH is a ready-to-use search field with a magnifying-glass icon pre-wired. Drop it into any FilterForm or FormBuilder — no startAdornment config needed.',
    color: '#0369a1',
  },
];

const techStack = [
  { label: 'MUI v9', color: '#0081cb' },
  { label: 'React Hook Form', color: '#ec5990' },
  { label: 'Zod', color: '#3068b7' },
  { label: 'TypeScript', color: '#3178c6' },
  { label: 'React 19', color: '#61dafb' },
];

const heroBadges = [
  {
    label: 'MIT License',
    bg: 'rgba(255,255,255,0.08)',
    color: 'rgba(255,255,255,0.9)',
    border: 'rgba(255,255,255,0.12)',
  },
  {
    label: `v${pkg.version}`,
    bg: 'rgba(255,255,255,0.08)',
    color: 'rgba(255,255,255,0.9)',
    border: 'rgba(255,255,255,0.12)',
    anim: true,
  },
  {
    label: 'TypeScript',
    bg: 'rgba(49,120,198,0.3)',
    color: '#93c5fd',
    border: 'rgba(49,120,198,0.4)',
  },
];

const heroOrbs = [
  {
    w: { xs: 300, md: 550 },
    h: { xs: 300, md: 550 },
    bg: 'rgba(37,99,235,0.28)',
    top: '-15%',
    left: '-8%',
    anim: 'float1 11s ease-in-out infinite',
  },
  {
    w: { xs: 250, md: 450 },
    h: { xs: 250, md: 450 },
    bg: 'rgba(124,58,237,0.22)',
    bottom: '-12%',
    right: '-5%',
    anim: 'float2 14s ease-in-out infinite',
  },
  {
    w: 200,
    h: 200,
    bg: 'rgba(6,182,212,0.15)',
    top: '40%',
    left: '60%',
    anim: 'float1 9s ease-in-out infinite reverse',
  },
];

const footerLinks = [
  { label: 'GitHub', href: 'https://github.com/APK-Arjun-Developer/mui-schema-form-builder' },
  { label: 'npm', href: 'https://www.npmjs.com/package/mui-schema-form-builder' },
  { label: 'Storybook', href: STORYBOOK_URL },
  {
    label: 'Issues',
    href: 'https://github.com/APK-Arjun-Developer/mui-schema-form-builder/issues',
  },
  {
    label: 'Changelog',
    href: 'https://github.com/APK-Arjun-Developer/mui-schema-form-builder/blob/main/CHANGELOG.md',
  },
];

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [copied, setCopied] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(
    () => () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    },
    [],
  );

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_CMD);
      setCopied(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable (non-HTTPS or permission denied)
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      {globalStyles}
      <CssBaseline />

      {/* ── Navbar ── */}
      <AppBar position="fixed" elevation={0} sx={getNavbarSx(scrolled)}>
        <Toolbar sx={navbarSx.toolbar}>
          <Typography sx={navbarSx.logo}>mui-schema-form-builder</Typography>

          <Chip label={`v${pkg.version}`} size="small" sx={navbarSx.versionChip} />

          <Button
            href="https://github.com/APK-Arjun-Developer/mui-schema-form-builder"
            target="_blank"
            rel="noopener noreferrer"
            size="small"
            sx={navbarSx.navLink}
          >
            GitHub
          </Button>
          <Button
            href={STORYBOOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            size="small"
            sx={navbarSx.navLink}
          >
            Storybook
          </Button>
          <Button
            href="https://www.npmjs.com/package/mui-schema-form-builder"
            target="_blank"
            rel="noopener noreferrer"
            variant="contained"
            size="small"
            disableElevation
            sx={navbarSx.npmButton}
          >
            npm
          </Button>
        </Toolbar>
      </AppBar>

      {/* ── Hero ── */}
      <Box sx={heroSx.section}>
        {heroOrbs.map((orb, i) => (
          <Box key={i} sx={getHeroOrbSx(orb)} />
        ))}

        <Container maxWidth="md" sx={heroSx.container}>
          <Stack direction="row" spacing={1} sx={heroSx.badgeStack}>
            {heroBadges.map((chip) => (
              <Chip key={chip.label} label={chip.label} size="small" sx={getHeroBadgeSx(chip)} />
            ))}
          </Stack>

          <Typography variant="h1" sx={heroSx.title}>
            MUI Schema
            <br />
            Form Builder
          </Typography>

          <Typography sx={heroSx.subtitle}>
            Schema-driven, type-safe form builder for{' '}
            <Box component="span" sx={heroSx.highlightMui}>
              MUI
            </Box>
            {' + '}
            <Box component="span" sx={heroSx.highlightRhf}>
              React Hook Form
            </Box>
            {' + '}
            <Box component="span" sx={heroSx.highlightZod}>
              Zod
            </Box>
          </Typography>

          <Box sx={heroSx.installBox}>
            <Typography sx={heroSx.installCmd}>$ {INSTALL_CMD}</Typography>
            <Button onClick={handleCopy} size="small" variant="outlined" sx={getHeroCopySx(copied)}>
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={heroSx.ctaStack}>
            <Button
              href="https://github.com/APK-Arjun-Developer/mui-schema-form-builder"
              target="_blank"
              rel="noopener noreferrer"
              variant="outlined"
              size="large"
              sx={heroSx.githubButton}
            >
              View on GitHub
            </Button>
            <Button
              href={STORYBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              variant="outlined"
              size="large"
              sx={heroSx.storybookButton}
            >
              View Storybook
            </Button>
            <Button
              href="#demo"
              variant="contained"
              size="large"
              disableElevation
              sx={heroSx.demoButton}
            >
              See Live Demo
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* ── Tech stack strip ── */}
      <Box sx={techStackSx.section}>
        <Container>
          <Stack direction="row" sx={techStackSx.stack}>
            <Typography sx={techStackSx.builtWithLabel}>Built with</Typography>
            {techStack.map((t) => (
              <Box key={t.label} sx={{ ...techStackSx.badge, color: t.color }}>
                {t.label}
              </Box>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* ── Features ── */}
      <Box sx={featuresSx.section}>
        <Container>
          <FadeInSection>
            <Typography variant="h3" sx={featuresSx.sectionTitle}>
              Everything you need
            </Typography>
            <Typography color="text.secondary" sx={featuresSx.sectionSubtitle}>
              Build complex, production-ready forms with a single config array and a Zod schema.
            </Typography>
          </FadeInSection>

          <Grid container spacing={3} sx={featuresSx.grid}>
            {features.map((f, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={f.title} sx={featuresSx.gridItem}>
                <FadeInSection delay={i * 80} sx={{ height: '100%', width: '100%' }}>
                  <Paper elevation={0} sx={getFeatureCardSx(f.color)}>
                    <Typography
                      className="card-num"
                      sx={{ ...featuresSx.cardNumBase, color: f.color }}
                    >
                      {f.num}
                    </Typography>

                    <Box sx={getFeatureBadgeSx(f.color)}>
                      <Typography sx={getFeatureNumSx(f.color)}>{f.num}</Typography>
                    </Box>

                    <Typography sx={featuresSx.cardTitle}>{f.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={featuresSx.cardDesc}>
                      {f.desc}
                    </Typography>
                  </Paper>
                </FadeInSection>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── Quick Start ── */}
      <Box sx={quickStartSx.section}>
        <Typography sx={quickStartSx.decorCode}>{'</>'}</Typography>
        <Box sx={quickStartSx.orbTop} />
        <Box sx={quickStartSx.orbBottom} />

        <Container maxWidth="md" sx={quickStartSx.container}>
          <FadeInSection>
            <Typography variant="h3" sx={quickStartSx.sectionTitle}>
              Quick Start
            </Typography>
            <Typography color="text.secondary" sx={quickStartSx.sectionSubtitle}>
              Up and running in under a minute.
            </Typography>
          </FadeInSection>

          <FadeInSection delay={100}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="overline" color="text.secondary" sx={quickStartSx.stepLabel}>
                  Install
                </Typography>
                <CodeBlock code={`$ npm install mui-schema-form-builder`} title="terminal" />
              </Box>

              <Box>
                <Typography variant="overline" color="text.secondary" sx={quickStartSx.stepLabel}>
                  Usage
                </Typography>
                <CodeBlock code={CODE_EXAMPLE} title="example.tsx" showLineNumbers />
              </Box>
            </Stack>
          </FadeInSection>
        </Container>
      </Box>

      {/* ── Live Demo ── */}
      <Box id="demo" sx={liveDemoSx.section}>
        <Box sx={liveDemoSx.orb} />
        <Container maxWidth="md" sx={liveDemoSx.container}>
          <FadeInSection>
            <Typography variant="h3" sx={liveDemoSx.sectionTitle}>
              Live Demo
            </Typography>
            <Typography color="text.secondary" sx={liveDemoSx.subtitle}>
              Every field below is powered by{' '}
              <Box component="span" sx={liveDemoSx.highlight}>
                mui-schema-form-builder
              </Box>
              .
            </Typography>
          </FadeInSection>
          <FadeInSection delay={100}>
            <ExampleForm />
          </FadeInSection>
        </Container>
      </Box>

      {/* ── Footer ── */}
      <Box sx={footerSx.section}>
        <Container>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={footerSx.innerStack}>
            <Box sx={footerSx.brandBox}>
              <Typography sx={footerSx.brandName}>mui-schema-form-builder</Typography>
              <Typography variant="body2" sx={footerSx.brandMeta}>
                MIT License · Built by{' '}
                <Box
                  component="a"
                  href="https://github.com/APK-Arjun-Developer"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={footerSx.authorLink}
                >
                  Arjun Prakash
                </Box>
              </Typography>
            </Box>

            <Stack direction="row" spacing={4} sx={footerSx.linksStack}>
              {footerLinks.map((link) => (
                <Box
                  key={link.label}
                  component="a"
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={footerSx.link}
                >
                  {link.label}
                </Box>
              ))}
            </Stack>
          </Stack>

          <Box sx={footerSx.bottomDivider}>
            <Typography variant="body2" sx={footerSx.copyright}>
              © {new Date().getFullYear()} mui-schema-form-builder · Schema-driven forms for the
              modern React stack
            </Typography>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
