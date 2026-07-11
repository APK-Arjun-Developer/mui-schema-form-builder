import React, { useMemo, useState } from 'react';
import { z } from 'zod';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  Paper,
  Tab,
  Tabs,
  Button,
  Chip,
  Stack,
  CircularProgress,
} from '@mui/material';
import type { FieldValues } from 'react-hook-form';
import { FormBuilder } from '../components/form-builder/FormBuilder';
import { FormWizard } from '../components/form-builder/FormWizard';
import { FilterForm } from '../components/form-builder/FilterForm';
import {
  FIELD_TYPE,
  type FieldConfig,
  type Option,
  type FormBuilderActionsParams,
  type FormWizardActionsParams,
} from '../components/form-builder/types/field.types';

// ─── Shared types ────────────────────────────────────────────────────────────

const formSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  age: z.number().min(18, 'You must be at least 18').max(100, 'Invalid age'),
  email: z
    .string()
    .email('Invalid email address')
    .max(100, 'Email must be less than 100 characters'),
  phoneNumber: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must be less than 15 digits')
    .regex(/^\+?[0-9\s-]+$/, 'Invalid phone number format'),
  country: z.string().min(1, 'Please select a country'),
  cityState: z
    .string()
    .min(3, 'City/State must be at least 3 characters')
    .max(100, 'City/State too long'),
  role: z.string().min(1, 'Please select a role'),
  skills: z.array(z.any()).min(1, 'Select at least one skill'),
  gender: z.string().min(1, 'Please select your gender'),
  bio: z.string().max(500, 'Bio too long'),
  interests: z.array(z.string()).min(1, 'Select at least one interest'),
  startDate: z.string().min(1, 'Please select a start date'),
  acceptTerms: z.boolean().refine((val) => val === true, { message: 'You must accept terms' }),
});

type FormData = z.infer<typeof formSchema>;

const STATIC_ASYNC_SKILLS: Option[] = [
  { label: 'React', value: 'react' },
  { label: 'TypeScript', value: 'ts' },
  { label: 'Node.js', value: 'node' },
  { label: 'Material UI', value: 'mui' },
  { label: 'PostgreSQL', value: 'postgres' },
  { label: 'Docker', value: 'docker' },
  { label: 'AWS', value: 'aws' },
];

async function fetchSkills(query: string): Promise<Option[]> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return STATIC_ASYNC_SKILLS.filter((s) => s.label.toLowerCase().includes(query.toLowerCase()));
}

// ─── Tab panel helper ─────────────────────────────────────────────────────────

function TabPanel({
  value,
  index,
  children,
}: {
  value: number;
  index: number;
  children: React.ReactNode;
}) {
  return value === index ? <Box sx={{ pt: 3 }}>{children}</Box> : null;
}

// ─── JSON preview ──────────────────────────────────────────────────────────────

function JsonPreview({ data }: { data: unknown }) {
  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Submitted Data
      </Typography>
      <Paper sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
        <pre style={{ margin: 0, overflow: 'auto', fontSize: 13 }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      </Paper>
    </Box>
  );
}

// ─── Tab 1: FormBuilder ───────────────────────────────────────────────────────

function FormBuilderDemo() {
  const [submittedData, setSubmittedData] = useState<FormData | null>(null);
  const [readOnly, setReadOnly] = useState(false);

  const fields = useMemo<FieldConfig[]>(
    () => [
      {
        name: 'fullName',
        label: 'Full Name',
        type: FIELD_TYPE.TEXT,
        required: true,
        grid: { xs: 12, sm: 6 },
        placeholder: 'Enter your full name',
        section: 'Personal Info',
      },
      {
        name: 'age',
        label: 'Age',
        type: FIELD_TYPE.NUMBER,
        required: true,
        grid: { xs: 12, sm: 6 },
        defaultValue: 25,
        min: 18,
        max: 100,
        section: 'Personal Info',
      },
      {
        name: 'email',
        label: 'Email Address',
        type: FIELD_TYPE.TEXT,
        required: true,
        grid: { xs: 12, sm: 6 },
        placeholder: 'john@example.com',
        section: 'Contact',
      },
      {
        name: 'phoneNumber',
        label: 'Phone Number',
        type: FIELD_TYPE.TEXT,
        required: true,
        grid: { xs: 12, sm: 6 },
        placeholder: 'Eg: 9876543210',
        section: 'Contact',
      },
      {
        name: 'country',
        label: 'Country',
        type: FIELD_TYPE.SELECT,
        required: true,
        grid: { xs: 12, sm: 6 },
        section: 'Contact',
        options: [
          { label: 'United States', value: 'us' },
          { label: 'United Kingdom', value: 'uk' },
          { label: 'Canada', value: 'ca' },
          { label: 'India', value: 'in' },
          { label: 'Australia', value: 'au' },
        ],
      },
      {
        name: 'cityState',
        label: 'City / State',
        type: FIELD_TYPE.TEXT,
        required: true,
        grid: { xs: 12, sm: 6 },
        placeholder: 'New York, NY',
        section: 'Contact',
        visibleIf: (values) => !!values['country'],
      },
      {
        name: 'role',
        label: 'Role',
        type: FIELD_TYPE.SELECT,
        required: true,
        grid: { xs: 12, sm: 6 },
        section: 'Professional',
        options: [
          { label: 'Developer', value: 'developer' },
          { label: 'Designer', value: 'designer' },
          { label: 'Product Manager', value: 'pm' },
        ],
      },
      {
        name: 'gender',
        label: 'Gender',
        type: FIELD_TYPE.RADIO,
        required: true,
        grid: { xs: 12, sm: 6 },
        section: 'Professional',
        options: [
          { label: 'Male', value: 'male' },
          { label: 'Female', value: 'female' },
          { label: 'Other', value: 'other' },
        ],
      },
      {
        name: 'startDate',
        label: 'Start Date',
        type: FIELD_TYPE.DATE,
        required: true,
        grid: { xs: 12, sm: 6 },
        section: 'Professional',
      },
      {
        name: 'interests',
        label: 'Interests',
        type: FIELD_TYPE.CHECKBOX,
        required: true,
        grid: { xs: 12, sm: 6 },
        section: 'Professional',
        options: [
          { label: 'Coding', value: 'coding' },
          { label: 'Gaming', value: 'gaming' },
          { label: 'Reading', value: 'reading' },
          { label: 'Travel', value: 'travel' },
        ],
      },
      {
        name: 'skills',
        label: 'Core Skills',
        type: FIELD_TYPE.AUTOCOMPLETE,
        required: true,
        multiple: true,
        grid: { xs: 12 },
        section: 'Professional',
        placeholder: 'Search for skills...',
        fetchOptions: fetchSkills,
      },
      {
        name: 'bio',
        label: 'Short Bio',
        type: FIELD_TYPE.TEXTAREA,
        grid: { xs: 12 },
        section: 'About',
        placeholder: 'Tell us about yourself...',
      },
      {
        name: 'acceptTerms',
        label: 'I accept the terms and conditions',
        type: FIELD_TYPE.CHECKBOX,
        required: true,
        grid: { xs: 12 },
        section: 'About',
        defaultValue: false,
      },
    ],
    [],
  );

  const handleSubmit = (data: FormData) => {
    setSubmittedData(data);
    setReadOnly(true);
  };

  return (
    <Box>
      {readOnly && submittedData && (
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip label="Read-only preview" color="success" size="small" />
          <Button size="small" variant="outlined" onClick={() => setReadOnly(false)}>
            Back to Edit
          </Button>
        </Box>
      )}
      <FormBuilder
        title="Your Profile"
        titleAlign="left"
        fields={fields}
        schema={formSchema}
        onSubmit={handleSubmit}
        onCancel={() => setSubmittedData(null)}
        onReset={() => {
          setSubmittedData(null);
          setReadOnly(false);
        }}
        readOnly={readOnly}
        renderActions={({ isSubmitting, submit, cancel, reset }: FormBuilderActionsParams) => (
          <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            {reset && (
              <Button
                size="small"
                color="inherit"
                onClick={reset}
                disabled={isSubmitting}
                sx={{ textTransform: 'none' }}
              >
                Clear Form
              </Button>
            )}
            {cancel && (
              <Button
                size="small"
                variant="outlined"
                onClick={cancel}
                disabled={isSubmitting}
                sx={{ textTransform: 'none' }}
              >
                Cancel
              </Button>
            )}
            <Button
              size="small"
              variant="contained"
              color="primary"
              onClick={submit}
              disabled={isSubmitting || readOnly}
              startIcon={isSubmitting ? <CircularProgress size={14} color="inherit" /> : undefined}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              {isSubmitting ? 'Saving…' : readOnly ? 'Confirmed' : 'Save Profile'}
            </Button>
          </Stack>
        )}
      />
      {submittedData && <JsonPreview data={submittedData} />}
    </Box>
  );
}

// ─── Tab 2: FormWizard ────────────────────────────────────────────────────────

const wizardSchema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  password: z.string().min(8, 'At least 8 characters'),
  country: z.string().min(1, 'Please select a country'),
  role: z.string().min(1, 'Please select a role'),
  startDate: z.string().min(1, 'Please select a date'),
  bio: z.string().optional(),
  acceptTerms: z.boolean().refine((v) => v, 'Must accept terms'),
});

function WizardDemo() {
  const [submittedData, setSubmittedData] = useState<z.infer<typeof wizardSchema> | null>(null);

  return (
    <Box>
      <FormWizard
        title="Application Form"
        titleAlign="center"
        schema={wizardSchema}
        steps={[
          {
            label: 'Personal',
            description: 'Name & contact',
            fields: [
              {
                name: 'firstName',
                label: 'First Name',
                type: FIELD_TYPE.TEXT,
                required: true,
                grid: { xs: 12, sm: 6 },
              },
              {
                name: 'lastName',
                label: 'Last Name',
                type: FIELD_TYPE.TEXT,
                required: true,
                grid: { xs: 12, sm: 6 },
              },
              {
                name: 'email',
                label: 'Email',
                type: FIELD_TYPE.TEXT,
                required: true,
                grid: { xs: 12, sm: 6 },
              },
              {
                name: 'phone',
                label: 'Phone',
                type: FIELD_TYPE.TEXT,
                grid: { xs: 12, sm: 6 },
              },
            ],
          },
          {
            label: 'Security',
            description: 'Set a password',
            fields: [
              {
                name: 'password',
                label: 'Password',
                type: FIELD_TYPE.PASSWORD,
                required: true,
              },
            ],
          },
          {
            label: 'Professional',
            description: 'Role & location',
            fields: [
              {
                name: 'country',
                label: 'Country',
                type: FIELD_TYPE.SELECT,
                required: true,
                grid: { xs: 12, sm: 6 },
                options: [
                  { label: 'United States', value: 'us' },
                  { label: 'Canada', value: 'ca' },
                  { label: 'United Kingdom', value: 'uk' },
                  { label: 'India', value: 'in' },
                ],
              },
              {
                name: 'role',
                label: 'Role',
                type: FIELD_TYPE.SELECT,
                required: true,
                grid: { xs: 12, sm: 6 },
                options: [
                  { label: 'Developer', value: 'developer' },
                  { label: 'Designer', value: 'designer' },
                  { label: 'Product Manager', value: 'pm' },
                ],
              },
              {
                name: 'startDate',
                label: 'Start Date',
                type: FIELD_TYPE.DATE,
                required: true,
                grid: { xs: 12, sm: 6 },
              },
              {
                name: 'bio',
                label: 'Short Bio',
                type: FIELD_TYPE.TEXTAREA,
                rows: 3,
                grid: { xs: 12 },
              },
            ],
          },
          {
            label: 'Review',
            description: 'Confirm & submit',
            fields: [
              {
                name: 'acceptTerms',
                label: 'I accept the terms and conditions',
                type: FIELD_TYPE.CHECKBOX,
                required: true,
              },
            ],
          },
        ]}
        onSubmit={(data) => setSubmittedData(data)}
        onCancel={() => setSubmittedData(null)}
        renderActions={({
          isSubmitting,
          isFirstStep,
          isLastStep,
          next,
          back,
          submit,
          cancel,
        }: FormWizardActionsParams) => (
          <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            {isFirstStep && cancel && (
              <Button
                variant="outlined"
                color="inherit"
                onClick={cancel}
                disabled={isSubmitting}
                sx={{ textTransform: 'none' }}
              >
                Cancel
              </Button>
            )}
            {!isFirstStep && (
              <Button
                variant="outlined"
                color="inherit"
                onClick={back}
                disabled={isSubmitting}
                sx={{ textTransform: 'none' }}
              >
                ← Back
              </Button>
            )}
            {isLastStep ? (
              <Button
                variant="contained"
                color="success"
                onClick={submit}
                disabled={isSubmitting}
                startIcon={
                  isSubmitting ? <CircularProgress size={14} color="inherit" /> : undefined
                }
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                {isSubmitting ? 'Submitting…' : 'Submit Application'}
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={next}
                disabled={isSubmitting}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Continue →
              </Button>
            )}
          </Stack>
        )}
      />
      {submittedData && <JsonPreview data={submittedData} />}
    </Box>
  );
}

// ─── Tab 3: Array fields ──────────────────────────────────────────────────────

const teamSchema = z.object({
  projectName: z.string().min(1, 'Required'),
  members: z
    .array(
      z.object({
        name: z.string().min(1, 'Name required'),
        email: z.string().email('Invalid email'),
        role: z.string().min(1, 'Role required'),
      }),
    )
    .min(1, 'Add at least one member'),
  tags: z.array(z.string()),
});

function ArrayFieldDemo() {
  const [submittedData, setSubmittedData] = useState<z.infer<typeof teamSchema> | null>(null);

  return (
    <Box>
      <FormBuilder
        schema={teamSchema}
        fields={[
          {
            name: 'projectName',
            label: 'Project Name',
            type: FIELD_TYPE.TEXT,
            required: true,
            section: 'Project',
          },
          {
            name: 'tags',
            label: 'Tags',
            type: FIELD_TYPE.CHECKBOX,
            section: 'Project',
            options: [
              { label: 'Frontend', value: 'fe' },
              { label: 'Backend', value: 'be' },
              { label: 'Mobile', value: 'mobile' },
              { label: 'Design', value: 'design' },
            ],
          },
          {
            name: 'members',
            label: 'Team Members',
            type: FIELD_TYPE.ARRAY,
            section: 'Team',
            itemFields: [
              {
                name: 'name',
                label: 'Name',
                type: FIELD_TYPE.TEXT,
                required: true,
                grid: { xs: 12, sm: 4 },
              },
              {
                name: 'email',
                label: 'Email',
                type: FIELD_TYPE.TEXT,
                required: true,
                grid: { xs: 12, sm: 4 },
              },
              {
                name: 'role',
                label: 'Role',
                type: FIELD_TYPE.SELECT,
                required: true,
                grid: { xs: 12, sm: 4 },
                options: [
                  { label: 'Developer', value: 'dev' },
                  { label: 'Designer', value: 'design' },
                  { label: 'Lead', value: 'lead' },
                ],
              },
            ],
            addLabel: '+ Add team member',
            minItems: 1,
            maxItems: 6,
          },
        ]}
        onSubmit={(data) => setSubmittedData(data)}
        onReset={() => setSubmittedData(null)}
        submitText="Create Project"
      />
      {submittedData && <JsonPreview data={submittedData} />}
    </Box>
  );
}

// ─── Tab 4: FilterForm ────────────────────────────────────────────────────────

const PRODUCTS = [
  { id: 1, name: 'React Developer Course', category: 'education', price: 49, inStock: true },
  { id: 2, name: 'TypeScript Handbook', category: 'books', price: 29, inStock: true },
  { id: 3, name: 'MUI Pro License', category: 'software', price: 299, inStock: false },
  { id: 4, name: 'VS Code Extension Pack', category: 'software', price: 79, inStock: true },
  { id: 5, name: 'Design System Template', category: 'templates', price: 59, inStock: true },
  { id: 6, name: 'Node.js Complete Guide', category: 'books', price: 35, inStock: false },
  { id: 7, name: 'Figma UI Kit', category: 'templates', price: 89, inStock: true },
  { id: 8, name: 'AWS Course Bundle', category: 'education', price: 129, inStock: true },
  { id: 9, name: 'Docker Deep Dive', category: 'education', price: 39, inStock: true },
  { id: 10, name: 'GraphQL Starter Kit', category: 'templates', price: 69, inStock: false },
];

const CATEGORY_COLORS: Record<string, string> = {
  education: '#2563eb',
  books: '#7c3aed',
  software: '#059669',
  templates: '#d97706',
};

function FilterFormDemo() {
  const [filters, setFilters] = useState<FieldValues>({});

  const filtered = PRODUCTS.filter((p) => {
    const search = String(filters.search ?? '').toLowerCase();
    const category = String(filters.category ?? '');
    const maxPrice =
      filters.maxPrice !== '' && filters.maxPrice != null ? Number(filters.maxPrice) : Infinity;
    const inStockOnly = Boolean(filters.inStock);

    return (
      (!search || p.name.toLowerCase().includes(search)) &&
      (!category || p.category === category) &&
      p.price <= maxPrice &&
      (!inStockOnly || p.inStock)
    );
  });

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Every keystroke updates the product list instantly — no submit button needed.
      </Typography>

      {/* Filter bar */}
      <Paper variant="outlined" sx={{ p: 2.5, mb: 3, borderRadius: 2 }}>
        <FilterForm
          showReset
          resetText="Clear filters"
          spacing={2}
          fields={[
            {
              name: 'search',
              label: 'Search',
              type: FIELD_TYPE.TEXT,
              placeholder: 'Search products…',
              grid: { xs: 12, sm: 4 },
            },
            {
              name: 'category',
              label: 'Category',
              type: FIELD_TYPE.SELECT,
              options: [
                { label: 'All categories', value: '' },
                { label: 'Education', value: 'education' },
                { label: 'Books', value: 'books' },
                { label: 'Software', value: 'software' },
                { label: 'Templates', value: 'templates' },
              ],
              grid: { xs: 12, sm: 4 },
            },
            {
              name: 'maxPrice',
              label: 'Max price ($)',
              type: FIELD_TYPE.NUMBER,
              min: 0,
              placeholder: 'Any',
              grid: { xs: 12, sm: 4 },
            },
            {
              name: 'inStock',
              label: 'In stock only',
              type: FIELD_TYPE.CHECKBOX,
              grid: { xs: 12, sm: 4 },
            },
          ]}
          onChange={setFilters}
        />
      </Paper>

      {/* Results */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {filtered.length} of {PRODUCTS.length} products
        </Typography>
        {filtered.length < PRODUCTS.length && (
          <Chip label="Filtered" size="small" color="primary" variant="outlined" />
        )}
      </Box>

      {filtered.length === 0 ? (
        <Paper
          variant="outlined"
          sx={{ p: 6, textAlign: 'center', borderRadius: 2, borderStyle: 'dashed' }}
        >
          <Typography color="text.secondary">No products match the current filters.</Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {filtered.map((product) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={product.id}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  transition: 'box-shadow 0.2s',
                  '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.1)' },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <Chip
                    label={product.category}
                    size="small"
                    sx={{
                      bgcolor: `${CATEGORY_COLORS[product.category]}18`,
                      color: CATEGORY_COLORS[product.category],
                      fontWeight: 600,
                      fontSize: 11,
                      border: `1px solid ${CATEGORY_COLORS[product.category]}33`,
                    }}
                  />
                  <Chip
                    label={product.inStock ? 'In stock' : 'Out of stock'}
                    size="small"
                    color={product.inStock ? 'success' : 'default'}
                    variant="outlined"
                    sx={{ fontSize: 11 }}
                  />
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.4 }}>
                  {product.name}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 800, color: 'primary.main', mt: 'auto' }}
                >
                  ${product.price}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      <Divider sx={{ my: 3 }} />
      <Typography variant="caption" color="text.secondary">
        Current filters:{' '}
        <Box component="span" sx={{ fontFamily: 'monospace' }}>
          {JSON.stringify(
            Object.fromEntries(
              Object.entries(filters).filter(([, v]) => v !== '' && v !== false && v != null),
            ),
            null,
            0,
          )}
        </Box>
      </Typography>
    </Box>
  );
}

// ─── Tab 5: ComboInput ────────────────────────────────────────────────────────

const SEARCH_PRODUCTS = [
  { name: 'Wireless Earbuds', category: 'electronics', price: 49 },
  { name: 'TypeScript Handbook', category: 'books', price: 29 },
  { name: 'Next.js Course', category: 'courses', price: 39 },
  { name: 'React Design Patterns', category: 'books', price: 35 },
  { name: 'MUI Pro License', category: 'software', price: 299 },
  { name: 'Mechanical Keyboard', category: 'electronics', price: 189 },
  { name: 'MacBook Stand', category: 'accessories', price: 79 },
  { name: 'Docker Deep Dive', category: 'courses', price: 49 },
];

const SEARCH_CATEGORY_COLORS: Record<string, string> = {
  electronics: '#2563eb',
  books: '#7c3aed',
  courses: '#0891b2',
  software: '#059669',
  accessories: '#d97706',
};

const comboOrderSchema = z.object({
  phone: z.object({
    select: z.string().min(1, 'Select a country code'),
    input: z.string().min(6, 'Enter a valid phone number'),
  }),
  declaredValue: z.object({
    select: z.string().min(1, 'Select a currency'),
    input: z.union([z.number().min(0.01, 'Enter a valid amount'), z.literal('')]),
  }),
  weight: z.object({
    select: z.string().min(1, 'Select a unit'),
    input: z.union([z.number().min(0.01, 'Enter package weight'), z.literal('')]),
  }),
  serviceType: z.string().min(1, 'Select a service type'),
});

function ComboInputDemo() {
  const [searchFilters, setSearchFilters] = useState<FieldValues>({});
  const [submitted, setSubmitted] = useState<z.infer<typeof comboOrderSchema> | null>(null);

  const combo = searchFilters.query as { select?: string; input?: string } | undefined;
  const keyword = (combo?.input ?? '').toLowerCase();
  const category = combo?.select ?? '';

  const filteredProducts = SEARCH_PRODUCTS.filter(
    (p) =>
      (!keyword || p.name.toLowerCase().includes(keyword)) &&
      (!category || p.category === category),
  );

  return (
    <Box>
      {/* ── Search bar ── */}
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
        Search bar — ComboInput with selector at end
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Category dropdown is fused to the right of the search field. Filters the product list live —
        no submit button needed.
      </Typography>

      <Paper variant="outlined" sx={{ p: 2.5, mb: 2.5, borderRadius: 2 }}>
        <FilterForm
          showReset
          resetText="Clear"
          fields={[
            {
              name: 'query',
              label: 'Search products',
              type: FIELD_TYPE.COMBO_INPUT,
              selectPosition: 'end',
              selectOptions: [
                { label: 'All categories', value: '' },
                { label: 'Electronics', value: 'electronics' },
                { label: 'Books', value: 'books' },
                { label: 'Courses', value: 'courses' },
                { label: 'Software', value: 'software' },
                { label: 'Accessories', value: 'accessories' },
              ],
              selectPlaceholder: 'Category',
              selectWidth: 140,
              inputType: 'search',
              placeholder: 'Search by name…',
              grid: { xs: 12 },
            },
          ]}
          onChange={setSearchFilters}
        />
      </Paper>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {filteredProducts.length} of {SEARCH_PRODUCTS.length} products
        </Typography>
        {filteredProducts.length < SEARCH_PRODUCTS.length && (
          <Chip label="Filtered" size="small" color="primary" variant="outlined" />
        )}
      </Box>

      {filteredProducts.length === 0 ? (
        <Paper
          variant="outlined"
          sx={{ p: 5, textAlign: 'center', borderRadius: 2, borderStyle: 'dashed', mb: 4 }}
        >
          <Typography color="text.secondary">No products match.</Typography>
        </Paper>
      ) : (
        <Grid container spacing={1.5} sx={{ mb: 4 }}>
          {filteredProducts.map((product) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={product.name}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2,
                  transition: 'box-shadow 0.2s',
                  '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.1)' },
                }}
              >
                <Chip
                  label={product.category}
                  size="small"
                  sx={{
                    mb: 1,
                    fontSize: 10,
                    fontWeight: 600,
                    bgcolor: `${SEARCH_CATEGORY_COLORS[product.category]}18`,
                    color: SEARCH_CATEGORY_COLORS[product.category],
                    border: `1px solid ${SEARCH_CATEGORY_COLORS[product.category]}33`,
                  }}
                />
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {product.name}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  ${product.price}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      <Divider sx={{ mb: 3 }} />

      {/* ── Order form ── */}
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
        Order form — phone, currency & weight combos
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Three ComboInput fields in one form: country code + phone, currency + amount, value + unit.
      </Typography>

      <FormBuilder
        schema={comboOrderSchema}
        fields={[
          {
            name: 'phone',
            label: 'Contact phone',
            type: FIELD_TYPE.COMBO_INPUT,
            required: true,
            selectOptions: [
              { label: '+1', value: '+1' },
              { label: '+44', value: '+44' },
              { label: '+49', value: '+49' },
              { label: '+33', value: '+33' },
              { label: '+91', value: '+91' },
              { label: '+81', value: '+81' },
            ],
            selectPlaceholder: 'Code',
            selectWidth: 88,
            placeholder: '(555) 000-0000',
            grid: { xs: 12, sm: 6 },
          },
          {
            name: 'serviceType',
            label: 'Service type',
            type: FIELD_TYPE.SELECT,
            required: true,
            options: [
              { label: 'Standard (5–7 days)', value: 'standard' },
              { label: 'Express (2–3 days)', value: 'express' },
              { label: 'Overnight', value: 'overnight' },
            ],
            grid: { xs: 12, sm: 6 },
          },
          {
            name: 'declaredValue',
            label: 'Declared value',
            type: FIELD_TYPE.COMBO_INPUT,
            required: true,
            selectOptions: [
              { label: 'USD $', value: 'usd' },
              { label: 'EUR €', value: 'eur' },
              { label: 'GBP £', value: 'gbp' },
            ],
            selectPlaceholder: 'Currency',
            selectWidth: 104,
            inputType: 'number',
            min: 0,
            placeholder: '0.00',
            grid: { xs: 12, sm: 6 },
          },
          {
            name: 'weight',
            label: 'Package weight',
            type: FIELD_TYPE.COMBO_INPUT,
            required: true,
            selectPosition: 'end',
            selectOptions: [
              { label: 'kg', value: 'kg' },
              { label: 'lb', value: 'lb' },
              { label: 'g', value: 'g' },
            ],
            selectPlaceholder: 'Unit',
            selectWidth: 80,
            inputType: 'number',
            min: 0,
            placeholder: '0.0',
            grid: { xs: 12, sm: 6 },
          },
        ]}
        onSubmit={(data) => setSubmitted(data)}
        onReset={() => setSubmitted(null)}
        submitText="Book shipment"
      />
      {submitted && <JsonPreview data={submitted} />}
    </Box>
  );
}

// ─── ExampleForm (tabbed) ──────────────────────────────────────────────────────

export const ExampleForm = () => {
  const [tab, setTab] = useState(0);

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 1 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v as number)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="FormBuilder" />
          <Tab label="Multi-step Wizard" />
          <Tab label="Array Fields" />
          <Tab label="Filter Form" />
          <Tab label="Combo Input" />
        </Tabs>
      </Box>

      <TabPanel value={tab} index={0}>
        <Card
          sx={{ borderRadius: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.08)', overflow: 'visible' }}
        >
          <CardContent sx={{ p: 4 }}>
            <FormBuilderDemo />
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tab} index={1}>
        <Card
          sx={{ borderRadius: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.08)', overflow: 'visible' }}
        >
          <CardContent sx={{ p: 4 }}>
            <WizardDemo />
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tab} index={2}>
        <Card
          sx={{ borderRadius: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.08)', overflow: 'visible' }}
        >
          <CardContent sx={{ p: 4 }}>
            <ArrayFieldDemo />
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tab} index={3}>
        <Card
          sx={{ borderRadius: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.08)', overflow: 'visible' }}
        >
          <CardContent sx={{ p: 4 }}>
            <FilterFormDemo />
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tab} index={4}>
        <Card
          sx={{ borderRadius: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.08)', overflow: 'visible' }}
        >
          <CardContent sx={{ p: 4 }}>
            <ComboInputDemo />
          </CardContent>
        </Card>
      </TabPanel>
    </Box>
  );
};
