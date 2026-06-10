import { useMemo, useState } from 'react';
import { z } from 'zod';
import { Typography, Box, Card, CardContent, Paper, Tab, Tabs, Button, Chip } from '@mui/material';
import { FormBuilder } from '../components/form-builder/FormBuilder';
import { FormWizard } from '../components/form-builder/FormWizard';
import {
  FIELD_TYPE,
  type FieldConfig,
  type Option,
} from '../components/form-builder/types/field.types';

// ─── Shared types ─────────────────────────────────────────────────────────────

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

// ─── JSON preview ─────────────────────────────────────────────────────────────

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
        placeholder: '+1 (555) 000-0000',
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
        fields={fields}
        schema={formSchema}
        onSubmit={handleSubmit}
        onCancel={() => setSubmittedData(null)}
        onReset={() => {
          setSubmittedData(null);
          setReadOnly(false);
        }}
        submitText={readOnly ? 'Confirmed' : 'Save Profile'}
        cancelText="Cancel"
        resetText="Clear Form"
        readOnly={readOnly}
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
              { name: 'phone', label: 'Phone', type: FIELD_TYPE.TEXT, grid: { xs: 12, sm: 6 } },
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
        submitText="Submit Application"
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

// ─── ExampleForm (tabbed) ─────────────────────────────────────────────────────

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
    </Box>
  );
};
