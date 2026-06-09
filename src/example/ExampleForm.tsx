import { useMemo, useState } from 'react';
import { z } from 'zod';
import { Container, Typography, Box, Card, CardContent, Paper } from '@mui/material';
import { FormBuilder } from '../components/form-builder/FormBuilder';
import {
  FIELD_TYPE,
  type FieldConfig,
  type Option,
} from '../components/form-builder/types/field.types';

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
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'You must accept terms',
  }),
});

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

export const ExampleForm = () => {
  const [submittedData, setSubmittedData] = useState<z.infer<typeof formSchema> | null>(null);

  // Memoized so the stable reference prevents unnecessary useFormBuilder recomputation.
  const fields = useMemo<FieldConfig[]>(
    () => [
      {
        name: 'fullName',
        label: 'Full Name',
        type: FIELD_TYPE.TEXT,
        required: true,
        grid: { xs: 12, sm: 8 },
        placeholder: 'Enter your full name',
      },
      {
        name: 'age',
        label: 'Age',
        type: FIELD_TYPE.NUMBER,
        required: true,
        grid: { xs: 12, sm: 4 },
        defaultValue: 25,
        min: 18,
        max: 100,
      },
      {
        name: 'email',
        label: 'Email Address',
        type: FIELD_TYPE.TEXT,
        required: true,
        grid: { xs: 12, sm: 6 },
        placeholder: 'john@example.com',
      },
      {
        name: 'phoneNumber',
        label: 'Phone Number',
        type: FIELD_TYPE.TEXT,
        required: true,
        grid: { xs: 12, sm: 6 },
        placeholder: '+1 (555) 000-0000',
      },
      {
        name: 'country',
        label: 'Country',
        type: FIELD_TYPE.SELECT,
        required: true,
        grid: { xs: 12, sm: 6 },
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
        visibleIf: (values) => !!values['country'],
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
        name: 'gender',
        label: 'Gender',
        type: FIELD_TYPE.RADIO,
        required: true,
        grid: { xs: 12, sm: 6 },
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
      },
      {
        name: 'interests',
        label: 'Interests',
        type: FIELD_TYPE.CHECKBOX,
        required: true,
        grid: { xs: 12, sm: 6 },
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
        placeholder: 'Search for skills...',
        fetchOptions: fetchSkills,
      },
      {
        name: 'bio',
        label: 'Short Bio',
        type: FIELD_TYPE.TEXTAREA,
        required: false,
        grid: { xs: 12 },
        placeholder: 'Tell us about yourself...',
      },
      {
        name: 'acceptTerms',
        label: 'I accept the terms and conditions',
        type: FIELD_TYPE.CHECKBOX,
        required: true,
        grid: { xs: 12 },
        defaultValue: false,
      },
    ],
    [],
  );

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    console.log('Form Submitted:', data);
    setSubmittedData(data);
  };

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography
          variant="h3"
          gutterBottom
          sx={{
            fontWeight: 800,
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          User Profile Setup
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Configure your professional identity with ease
        </Typography>
      </Box>

      <Card sx={{ borderRadius: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.08)', overflow: 'visible' }}>
        <CardContent sx={{ p: 4 }}>
          <FormBuilder
            fields={fields}
            schema={formSchema}
            onSubmit={handleSubmit}
            onCancel={() => setSubmittedData(null)}
            onReset={() => setSubmittedData(null)}
            submitText="Save Profile"
            cancelText="Cancel"
            resetText="Clear Form"
          />
        </CardContent>
      </Card>

      {submittedData && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Submitted Data:
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
            <pre style={{ margin: 0, overflow: 'auto' }}>
              {JSON.stringify(submittedData, null, 2)}
            </pre>
          </Paper>
        </Box>
      )}
    </Container>
  );
};
