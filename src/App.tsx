import { useState, useEffect, useRef, type ReactNode } from 'react';
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

function FadeInSection({
  children,
  delay = 0,
  sx,
}: {
  children: ReactNode;
  delay?: number;
  sx?: React.ComponentProps<typeof Box>['sx'];
}) {
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
}

// ─── Syntax tokenizer (VS Code Dark+ palette) ─────────────────────────────────

const TC = {
  keyword: '#c586c0', // import, export, from, return, default, async, await
  decl: '#569cd6', // const, let, var, function, new, type
  string: '#ce9178', // string literals
  type: '#4ec9b0', // PascalCase identifiers
  fn: '#dcdcaa', // function calls
  prop: '#9cdcfe', // property keys (before :)
  number: '#b5cea8', // numeric literals
  bool: '#569cd6', // true, false, null, undefined
  comment: '#6a9955', // // comments
  plain: '#d4d4d4', // default text
  dim: '#6b7280', // very dim ($ prompt, line numbers)
};

type SToken = { text: string; color: string };

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

function CodeBlock({
  code,
  title,
  showLineNumbers = false,
}: {
  code: string;
  title?: string;
  showLineNumbers?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable (non-HTTPS or permission denied)
    }
  };

  const lines = code.split('\n');

  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: '#1e1e1e',
        borderRadius: 2.5,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Title bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2,
          py: 1.25,
          bgcolor: '#252526',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* macOS traffic-light dots */}
        <Box sx={{ display: 'flex', gap: '5px', flexShrink: 0 }}>
          {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
            <Box key={c} sx={{ width: 11, height: 11, borderRadius: '50%', bgcolor: c }} />
          ))}
        </Box>

        {title && (
          <Typography
            sx={{
              color: 'rgba(255,255,255,0.4)',
              fontSize: 12,
              fontFamily: '"Fira Code", "Consolas", monospace',
              flexGrow: 1,
            }}
          >
            {title}
          </Typography>
        )}

        <Button
          size="small"
          onClick={handleCopy}
          sx={{
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
          }}
        >
          {copied ? '✓ Copied' : 'Copy'}
        </Button>
      </Box>

      {/* Code body */}
      <Box sx={{ p: { xs: 2, md: 2.5 }, overflow: 'auto' }}>
        <Box
          sx={{
            fontFamily: '"Fira Code", "JetBrains Mono", "Consolas", "Monaco", monospace',
            fontSize: 13,
            lineHeight: 1.85,
          }}
        >
          {lines.map((line, i) => (
            <div key={i} style={{ display: 'flex' }}>
              {showLineNumbers && (
                <span
                  style={{
                    color: '#495162',
                    userSelect: 'none',
                    paddingRight: 20,
                    minWidth: 36,
                    textAlign: 'right',
                    flexShrink: 0,
                    display: 'inline-block',
                  }}
                >
                  {i + 1}
                </span>
              )}
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
}

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
];

const techStack = [
  { label: 'MUI v9', color: '#0081cb' },
  { label: 'React Hook Form', color: '#ec5990' },
  { label: 'Zod', color: '#3068b7' },
  { label: 'TypeScript', color: '#3178c6' },
  { label: 'React 19', color: '#61dafb' },
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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_CMD);
      setCopied(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable (non-HTTPS or permission denied)
    }
  };

  return (
    <ThemeProvider theme={theme}>
      {globalStyles}
      <CssBaseline />

      {/* ── Navbar — hidden until scrolled, then slides in as dark glass ── */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          transform: scrolled ? 'translateY(0)' : 'translateY(-110%)',
          bgcolor: 'rgba(10, 15, 30, 0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          transition: 'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Toolbar sx={{ gap: 1, px: { xs: 2, md: 3 }, minHeight: { xs: 56 } }}>
          {/* Package name */}
          <Typography
            sx={{
              display: { xs: 'none', sm: 'block' },
              fontWeight: 800,
              fontSize: 15,
              letterSpacing: -0.4,
              background: 'linear-gradient(90deg, #60a5fa, #a78bfa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            mui-schema-form-builder
          </Typography>

          {/* Version badge */}
          <Chip
            label={`v${pkg.version}`}
            size="small"
            sx={{
              height: 18,
              fontSize: 10,
              fontWeight: 700,
              bgcolor: 'rgba(96,165,250,0.15)',
              color: '#93c5fd',
              border: '1px solid rgba(96,165,250,0.25)',
              mr: 'auto',
            }}
          />

          <Button
            href="https://github.com/APK-Arjun-Developer/mui-schema-form-builder"
            target="_blank"
            rel="noopener noreferrer"
            size="small"
            sx={{ color: 'rgba(255,255,255,0.65)', fontWeight: 600, '&:hover': { color: 'white' } }}
          >
            GitHub
          </Button>
          <Button
            href={STORYBOOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            size="small"
            sx={{ color: 'rgba(255,255,255,0.65)', fontWeight: 600, '&:hover': { color: 'white' } }}
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
            sx={{
              bgcolor: '#2563eb',
              '&:hover': { bgcolor: '#1d4ed8' },
              borderRadius: 2,
              fontWeight: 700,
            }}
          >
            npm
          </Button>
        </Toolbar>
      </AppBar>

      {/* ── Hero ── */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(-45deg, #0f172a, #1e3a8a, #1e1b4b, #0f172a)',
          backgroundSize: '400% 400%',
          animation: 'gradientShift 18s ease infinite',
          color: 'white',
          py: { xs: 12, md: 18 },
          textAlign: 'center',
        }}
      >
        {[
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
        ].map((orb, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              width: orb.w,
              height: orb.h,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${orb.bg} 0%, transparent 70%)`,
              filter: 'blur(55px)',
              ...('top' in orb ? { top: orb.top } : {}),
              ...('bottom' in orb ? { bottom: orb.bottom } : {}),
              ...('left' in orb ? { left: orb.left } : {}),
              ...('right' in orb ? { right: orb.right } : {}),
              animation: orb.anim,
              pointerEvents: 'none',
            }}
          />
        ))}

        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Stack
            direction="row"
            spacing={1}
            sx={{ justifyContent: 'center', flexWrap: 'wrap', gap: 1, mb: 4 }}
          >
            {[
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
            ].map((chip) => (
              <Chip
                key={chip.label}
                label={chip.label}
                size="small"
                sx={{
                  bgcolor: chip.bg,
                  color: chip.color,
                  fontWeight: 700,
                  border: `1px solid ${chip.border}`,

                  ...(chip.anim ? { animation: 'pulse 3s ease infinite' } : {}),
                  '& span': {
                    height: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                }}
              />
            ))}
          </Stack>

          <Typography
            variant="h1"
            sx={{
              mb: 2.5,
              fontWeight: 900,
              fontSize: { xs: '2.2rem', sm: '3rem', md: '4rem' },
              letterSpacing: -2,
              background: 'linear-gradient(135deg, #ffffff 0%, #93c5fd 50%, #c4b5fd 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1.1,
            }}
          >
            MUI Schema
            <br />
            Form Builder
          </Typography>

          <Typography
            sx={{
              mb: 6,
              color: 'rgba(255,255,255,0.6)',
              maxWidth: 520,
              mx: 'auto',
              lineHeight: 1.85,
              fontSize: { xs: '1rem', md: '1.15rem' },
            }}
          >
            Schema-driven, type-safe form builder for{' '}
            <Box component="span" sx={{ color: '#60a5fa', fontWeight: 700 }}>
              MUI
            </Box>
            {' + '}
            <Box component="span" sx={{ color: '#f472b6', fontWeight: 700 }}>
              React Hook Form
            </Box>
            {' + '}
            <Box component="span" sx={{ color: '#34d399', fontWeight: 700 }}>
              Zod
            </Box>
          </Typography>

          <Box
            sx={{
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
            }}
          >
            <Typography
              sx={{
                fontFamily: 'monospace',
                fontSize: { xs: 13, md: 15 },
                color: 'rgba(255,255,255,0.85)',
                letterSpacing: 0.4,
                whiteSpace: 'nowrap',
              }}
            >
              $ {INSTALL_CMD}
            </Typography>
            <Button
              onClick={handleCopy}
              size="small"
              variant="outlined"
              sx={{
                color: copied ? '#34d399' : 'white',
                borderColor: copied ? '#34d399' : 'rgba(255,255,255,0.25)',
                minWidth: 76,
                flexShrink: 0,
                fontSize: 12,
                fontWeight: 600,
                transition: 'all 0.3s',
                '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.08)' },
              }}
            >
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </Box>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}
          >
            <Button
              href="https://github.com/APK-Arjun-Developer/mui-schema-form-builder"
              target="_blank"
              rel="noopener noreferrer"
              variant="outlined"
              size="large"
              sx={{
                color: 'white',
                borderColor: 'rgba(255,255,255,0.3)',
                px: 4,
                borderRadius: 2.5,
                '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.07)' },
              }}
            >
              View on GitHub
            </Button>
            <Button
              href={STORYBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              variant="outlined"
              size="large"
              sx={{
                color: '#e9d5ff',
                borderColor: 'rgba(167,139,250,0.4)',
                px: 4,
                borderRadius: 2.5,
                '&:hover': { borderColor: '#a78bfa', bgcolor: 'rgba(167,139,250,0.08)' },
              }}
            >
              View Storybook
            </Button>
            <Button
              href="#demo"
              variant="contained"
              size="large"
              disableElevation
              sx={{
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
                  background:
                    'linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)',
                  animation: 'shimmer 3.5s ease infinite',
                },
                '&:hover': { bgcolor: '#1d4ed8' },
              }}
            >
              See Live Demo
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* ── Tech stack strip ── */}
      <Box sx={{ bgcolor: '#0f172a', py: 3, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Container>
          <Stack
            direction="row"
            sx={{
              justifyContent: 'center',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: { xs: 1.5, md: 3 },
            }}
          >
            <Typography
              sx={{
                color: 'rgba(255,255,255,0.3)',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1.5,
                textTransform: 'uppercase',
                mr: 1,
              }}
            >
              Built with
            </Typography>
            {techStack.map((t) => (
              <Box
                key={t.label}
                sx={{
                  px: 2,
                  py: 0.75,
                  borderRadius: 5,
                  border: '1px solid rgba(255,255,255,0.08)',
                  bgcolor: 'rgba(255,255,255,0.04)',
                  color: t.color,
                  fontSize: 13,
                  fontWeight: 600,
                  transition: 'all 0.2s',
                  cursor: 'default',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', transform: 'translateY(-2px)' },
                }}
              >
                {t.label}
              </Box>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* ── Features ── */}
      <Box
        sx={{
          py: { xs: 10, md: 14 },
          bgcolor: '#f0f4ff',
          backgroundImage: 'radial-gradient(circle, rgba(37,99,235,0.08) 1.5px, transparent 1.5px)',
          backgroundSize: '28px 28px',
        }}
      >
        <Container>
          <FadeInSection>
            <Typography
              variant="h3"
              sx={{ textAlign: 'center', fontWeight: 800, mb: 1.5, letterSpacing: -1 }}
            >
              Everything you need
            </Typography>
            <Typography
              color="text.secondary"
              sx={{ textAlign: 'center', mb: 8, maxWidth: 480, mx: 'auto', lineHeight: 1.8 }}
            >
              Build complex, production-ready forms with a single config array and a Zod schema.
            </Typography>
          </FadeInSection>

          <Grid container spacing={3} sx={{ alignItems: 'stretch' }}>
            {features.map((f, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={f.title} sx={{ display: 'flex' }}>
                <FadeInSection delay={i * 80} sx={{ height: '100%', width: '100%' }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3.5,
                      height: '100%',
                      position: 'relative',
                      overflow: 'hidden',
                      border: '1px solid rgba(0,0,0,0.07)',
                      borderRadius: 3,
                      bgcolor: 'white',
                      '&:hover': {
                        boxShadow: `0 20px 48px ${f.color}1a`,
                        borderColor: `${f.color}55`,
                      },
                      '&:hover .card-num': { opacity: 0.07 },
                    }}
                  >
                    {/* Large decorative number in background */}
                    <Typography
                      className="card-num"
                      sx={{
                        position: 'absolute',
                        top: -14,
                        right: 8,
                        fontSize: 96,
                        fontWeight: 900,
                        lineHeight: 1,
                        color: f.color,
                        opacity: 0.04,
                        fontFamily: 'monospace',
                        userSelect: 'none',
                        pointerEvents: 'none',
                        transition: 'opacity 0.22s ease',
                      }}
                    >
                      {f.num}
                    </Typography>

                    {/* Badge */}
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 2.5,
                        background: `linear-gradient(135deg, ${f.color}1a, ${f.color}33)`,
                        border: `1px solid ${f.color}2e`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2.5,
                      }}
                    >
                      <Typography
                        sx={{
                          color: f.color,
                          fontWeight: 800,
                          fontSize: 13,
                          fontFamily: 'monospace',
                        }}
                      >
                        {f.num}
                      </Typography>
                    </Box>

                    <Typography sx={{ fontWeight: 700, mb: 1, fontSize: '1rem' }}>
                      {f.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
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
      <Box
        sx={{
          py: { xs: 10, md: 14 },
          position: 'relative',
          overflow: 'hidden',
          bgcolor: '#fafbff',
          backgroundImage: [
            'linear-gradient(rgba(37,99,235,0.045) 1px, transparent 1px)',
            'linear-gradient(90deg, rgba(37,99,235,0.045) 1px, transparent 1px)',
          ].join(', '),
          backgroundSize: '52px 52px',
        }}
      >
        {/* Decorative faint code symbol */}
        <Typography
          sx={{
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
          }}
        >
          {'</>'}
        </Typography>

        {/* Gradient orbs */}
        <Box
          sx={{
            position: 'absolute',
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(37,99,235,0.07) 0%, transparent 70%)',
            filter: 'blur(60px)',
            top: '-20%',
            right: '-5%',
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            width: 350,
            height: 350,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)',
            filter: 'blur(50px)',
            bottom: '-10%',
            left: '0%',
            pointerEvents: 'none',
          }}
        />

        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <FadeInSection>
            <Typography
              variant="h3"
              sx={{ textAlign: 'center', fontWeight: 800, mb: 1.5, letterSpacing: -1 }}
            >
              Quick Start
            </Typography>
            <Typography
              color="text.secondary"
              sx={{ textAlign: 'center', mb: 7, maxWidth: 420, mx: 'auto' }}
            >
              Up and running in under a minute.
            </Typography>
          </FadeInSection>

          <FadeInSection delay={100}>
            <Stack spacing={3}>
              <Box>
                <Typography
                  variant="overline"
                  color="text.secondary"
                  sx={{ fontWeight: 700, letterSpacing: 1.5, display: 'block', mb: 1.5 }}
                >
                  Install
                </Typography>
                <CodeBlock code={`$ npm install mui-schema-form-builder`} title="terminal" />
              </Box>

              <Box>
                <Typography
                  variant="overline"
                  color="text.secondary"
                  sx={{ fontWeight: 700, letterSpacing: 1.5, display: 'block', mb: 1.5 }}
                >
                  Usage
                </Typography>
                <CodeBlock code={CODE_EXAMPLE} title="example.tsx" showLineNumbers />
              </Box>
            </Stack>
          </FadeInSection>
        </Container>
      </Box>

      {/* ── Live Demo ── */}
      <Box
        id="demo"
        sx={{
          py: { xs: 10, md: 14 },
          background: 'linear-gradient(180deg, #f0f4ff 0%, #f8fafc 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(37,99,235,0.05) 0%, transparent 70%)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
          }}
        />
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <FadeInSection>
            <Typography
              variant="h3"
              sx={{ textAlign: 'center', fontWeight: 800, mb: 1.5, letterSpacing: -1 }}
            >
              Live Demo
            </Typography>
            <Typography color="text.secondary" sx={{ textAlign: 'center', mb: 6 }}>
              Every field below is powered by{' '}
              <Box
                component="span"
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(90deg, #2563eb, #7c3aed)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
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
      <Box sx={{ bgcolor: '#0f172a', py: 7, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <Container>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={3}
            sx={{
              justifyContent: 'space-between',
              alignItems: { xs: 'center', sm: 'flex-start' },
              mb: 5,
            }}
          >
            <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: 15,
                  background: 'linear-gradient(90deg, #60a5fa, #a78bfa)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 0.75,
                }}
              >
                mui-schema-form-builder
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.35)', lineHeight: 1.7 }}>
                MIT License · Built by{' '}
                <Box
                  component="a"
                  href="https://github.com/APK-Arjun-Developer"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: '#60a5fa',
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  Arjun Prakash
                </Box>
              </Typography>
            </Box>

            <Stack direction="row" spacing={4} sx={{ alignItems: 'center' }}>
              {[
                {
                  label: 'GitHub',
                  href: 'https://github.com/APK-Arjun-Developer/mui-schema-form-builder',
                },
                { label: 'npm', href: 'https://www.npmjs.com/package/mui-schema-form-builder' },
                {
                  label: 'Storybook',
                  href: STORYBOOK_URL,
                },
                {
                  label: 'Issues',
                  href: 'https://github.com/APK-Arjun-Developer/mui-schema-form-builder/issues',
                },
                {
                  label: 'Changelog',
                  href: 'https://github.com/APK-Arjun-Developer/mui-schema-form-builder/blob/main/CHANGELOG.md',
                },
              ].map((link) => (
                <Box
                  key={link.label}
                  component="a"
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: 'rgba(255,255,255,0.4)',
                    textDecoration: 'none',
                    fontSize: 14,
                    transition: 'color 0.2s',
                    '&:hover': { color: 'white' },
                  }}
                >
                  {link.label}
                </Box>
              ))}
            </Stack>
          </Stack>

          <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.06)', pt: 4 }}>
            <Typography
              variant="body2"
              sx={{ color: 'rgba(255,255,255,0.2)', textAlign: 'center' }}
            >
              © {new Date().getFullYear()} mui-schema-form-builder · Schema-driven forms for the
              modern React stack
            </Typography>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
