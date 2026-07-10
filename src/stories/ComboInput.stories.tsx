import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Box, Chip, Divider, Grid, Paper, Typography } from '@mui/material';
import { z } from 'zod';
import type { FieldValues } from 'react-hook-form';
import { FormBuilder } from '../components/form-builder/FormBuilder';
import { FilterForm } from '../components/form-builder/FilterForm';
import { FIELD_TYPE } from '../components/form-builder/types/field.types';

const meta: Meta = {
  title: 'ComboInput',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A fused Select + text/number/search input rendered as a single compound field. The RHF value shape is `{ select, input }`. Use `selectPosition` to flip which side the dropdown appears on.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

// ---------------------------------------------------------------------------
// Phone number — country code at start
// ---------------------------------------------------------------------------
export const PhoneNumber: Story = {
  name: 'Phone number (code + number)',
  parameters: {
    docs: {
      description: {
        story:
          'Country-code selector fused to the left of a text input. Both parts live in a single `{ select, input }` field value.',
      },
    },
  },
  render: () => (
    <FormBuilder
      fields={[
        {
          name: 'phone',
          label: 'Phone number',
          type: FIELD_TYPE.COMBO_INPUT,
          required: true,
          selectOptions: [
            { label: '+1', value: '+1' },
            { label: '+44', value: '+44' },
            { label: '+49', value: '+49' },
            { label: '+33', value: '+33' },
            { label: '+81', value: '+81' },
            { label: '+91', value: '+91' },
          ],
          selectPlaceholder: 'Code',
          selectWidth: 88,
          placeholder: '(555) 000-0000',
        },
      ]}
      schema={z.object({
        phone: z.object({
          select: z.string().min(1, 'Select a country code'),
          input: z.string().min(6, 'Enter a valid phone number'),
        }),
      })}
      onSubmit={(d) => alert(JSON.stringify(d, null, 2))}
    />
  ),
};

// ---------------------------------------------------------------------------
// Currency amount — currency selector at start, number input
// ---------------------------------------------------------------------------
export const CurrencyAmount: Story = {
  name: 'Currency amount',
  parameters: {
    docs: {
      description: {
        story:
          '`inputType: "number"` stores the text portion as a JS number. The currency symbol dropdown sits flush on the left.',
      },
    },
  },
  render: () => (
    <FormBuilder
      fields={[
        {
          name: 'amount',
          label: 'Amount',
          type: FIELD_TYPE.COMBO_INPUT,
          required: true,
          selectOptions: [
            { label: 'USD $', value: 'usd' },
            { label: 'EUR €', value: 'eur' },
            { label: 'GBP £', value: 'gbp' },
            { label: 'JPY ¥', value: 'jpy' },
            { label: 'INR ₹', value: 'inr' },
          ],
          selectPlaceholder: 'Currency',
          selectWidth: 104,
          inputType: 'number',
          min: 0,
          placeholder: '0.00',
        },
      ]}
      schema={z.object({
        amount: z.object({
          select: z.string().min(1, 'Select a currency'),
          input: z.union([z.number().min(0.01, 'Enter a valid amount'), z.literal('')]),
        }),
      })}
      onSubmit={(d) => alert(JSON.stringify(d, null, 2))}
    />
  ),
};

// ---------------------------------------------------------------------------
// Search with category — selector at END
// ---------------------------------------------------------------------------
function SearchWithCategoryRender() {
  const [value, setValue] = useState<FieldValues>({});
  const combo = value.query as { select?: string; input?: string } | undefined;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <FilterForm
        fields={[
          {
            name: 'query',
            label: 'Search',
            type: FIELD_TYPE.COMBO_INPUT,
            selectPosition: 'end',
            selectOptions: [
              { label: 'All', value: '' },
              { label: 'Books', value: 'books' },
              { label: 'Electronics', value: 'electronics' },
              { label: 'Clothing', value: 'clothing' },
              { label: 'Software', value: 'software' },
            ],
            selectPlaceholder: 'Category',
            selectWidth: 130,
            inputType: 'search',
            placeholder: 'Search products…',
            grid: { xs: 12 },
          },
        ]}
        onChange={setValue}
      />
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          onChange value
        </Typography>
        <pre style={{ margin: 0, fontSize: 12 }}>
          {JSON.stringify({ keyword: combo?.input ?? '', category: combo?.select ?? '' }, null, 2)}
        </pre>
      </Paper>
    </Box>
  );
}

export const SearchWithCategory: Story = {
  name: 'Search + category (selector at end)',
  parameters: {
    docs: {
      description: {
        story:
          '`selectPosition: "end"` moves the dropdown to the right. The free-text search input spans the remaining width. Ideal for search bars.',
      },
    },
  },
  render: () => <SearchWithCategoryRender />,
};

// ---------------------------------------------------------------------------
// Measurement with unit — unit selector at END
// ---------------------------------------------------------------------------
export const MeasurementUnit: Story = {
  name: 'Measurement + unit (selector at end)',
  parameters: {
    docs: {
      description: {
        story:
          'Number input on the left, unit dropdown on the right. Good for weight, distance, volume, temperature, etc.',
      },
    },
  },
  render: () => (
    <FormBuilder
      fields={[
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
            { label: 'oz', value: 'oz' },
          ],
          selectPlaceholder: 'Unit',
          selectWidth: 80,
          inputType: 'number',
          min: 0,
          placeholder: '0.0',
        },
      ]}
      schema={z.object({
        weight: z.object({
          select: z.string().min(1, 'Select a unit'),
          input: z.union([z.number().min(0.01, 'Enter weight'), z.literal('')]),
        }),
      })}
      onSubmit={(d) => alert(JSON.stringify(d, null, 2))}
    />
  ),
};

// ---------------------------------------------------------------------------
// All variants at a glance
// ---------------------------------------------------------------------------
export const AllVariants: Story = {
  name: 'All variants at a glance',
  parameters: {
    docs: {
      description: {
        story: 'Four ComboInput patterns side-by-side: phone, currency, search, and measurement.',
      },
    },
  },
  render: () => (
    <FormBuilder
      title="All ComboInput variants"
      fields={[
        {
          name: 'phone',
          label: 'Phone',
          type: FIELD_TYPE.COMBO_INPUT,
          selectOptions: [
            { label: '+1', value: '+1' },
            { label: '+44', value: '+44' },
            { label: '+91', value: '+91' },
          ],
          selectPlaceholder: 'Code',
          selectWidth: 88,
          placeholder: '(555) 000-0000',
          grid: { xs: 12, sm: 6 },
        },
        {
          name: 'amount',
          label: 'Amount',
          type: FIELD_TYPE.COMBO_INPUT,
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
          name: 'search',
          label: 'Search',
          type: FIELD_TYPE.COMBO_INPUT,
          selectPosition: 'end',
          selectOptions: [
            { label: 'All', value: '' },
            { label: 'Books', value: 'books' },
            { label: 'Electronics', value: 'electronics' },
          ],
          selectPlaceholder: 'Category',
          selectWidth: 130,
          inputType: 'search',
          placeholder: 'Search products…',
          grid: { xs: 12, sm: 6 },
        },
        {
          name: 'weight',
          label: 'Weight',
          type: FIELD_TYPE.COMBO_INPUT,
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
      schema={z.object({
        phone: z.object({ select: z.string(), input: z.string() }),
        amount: z.object({ select: z.string(), input: z.union([z.number(), z.literal('')]) }),
        search: z.object({ select: z.string(), input: z.string() }),
        weight: z.object({ select: z.string(), input: z.union([z.number(), z.literal('')]) }),
      })}
      onSubmit={(d) => alert(JSON.stringify(d, null, 2))}
    />
  ),
};

// ---------------------------------------------------------------------------
// Live onChange output
// ---------------------------------------------------------------------------
function LiveValuesRender() {
  const [values, setValues] = useState<FieldValues>({});

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <FilterForm
        fields={[
          {
            name: 'phone',
            label: 'Phone number',
            type: FIELD_TYPE.COMBO_INPUT,
            selectOptions: [
              { label: '+1', value: '+1' },
              { label: '+44', value: '+44' },
              { label: '+49', value: '+49' },
              { label: '+91', value: '+91' },
            ],
            selectPlaceholder: 'Code',
            selectWidth: 88,
            placeholder: '(555) 000-0000',
            grid: { xs: 12, sm: 7 },
          },
          {
            name: 'currency',
            label: 'Amount',
            type: FIELD_TYPE.COMBO_INPUT,
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
            grid: { xs: 12, sm: 5 },
          },
        ]}
        onChange={setValues}
      />
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          onChange output
        </Typography>
        <pre style={{ margin: 0, fontSize: 12 }}>{JSON.stringify(values, null, 2)}</pre>
      </Paper>
    </Box>
  );
}

export const LiveValues: Story = {
  name: 'Live onChange values',
  parameters: {
    docs: {
      description: {
        story:
          'Every change to either sub-input fires `onChange` with the full `{ select, input }` object. The panel below shows the live payload.',
      },
    },
  },
  render: () => <LiveValuesRender />,
};

// ---------------------------------------------------------------------------
// Search bar driving a live list — real-world pattern
// ---------------------------------------------------------------------------

const DEMO_ITEMS = [
  { name: 'Wireless Earbuds', category: 'electronics', price: 49 },
  { name: 'TypeScript Handbook', category: 'books', price: 29 },
  { name: 'Next.js Course', category: 'courses', price: 39 },
  { name: 'React Design Patterns', category: 'books', price: 35 },
  { name: 'MUI Pro License', category: 'software', price: 299 },
  { name: 'Mechanical Keyboard', category: 'electronics', price: 189 },
  { name: 'MacBook Stand', category: 'accessories', price: 79 },
  { name: 'Docker Deep Dive', category: 'courses', price: 49 },
];

const CATEGORY_CHIP_COLORS: Record<string, string> = {
  electronics: '#2563eb',
  books: '#7c3aed',
  courses: '#0891b2',
  software: '#059669',
  accessories: '#d97706',
};

function LiveSearchBarRender() {
  const [filters, setFilters] = useState<FieldValues>({});
  const combo = filters.query as { select?: string; input?: string } | undefined;
  const keyword = (combo?.input ?? '').toLowerCase();
  const category = combo?.select ?? '';

  const items = DEMO_ITEMS.filter(
    (item) =>
      (!keyword || item.name.toLowerCase().includes(keyword)) &&
      (!category || item.category === category),
  );

  return (
    <Box>
      <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
        <FilterForm
          showReset
          fields={[
            {
              name: 'query',
              label: 'Search products',
              type: FIELD_TYPE.COMBO_INPUT,
              selectPosition: 'end',
              selectOptions: [
                { label: 'All', value: '' },
                { label: 'Electronics', value: 'electronics' },
                { label: 'Books', value: 'books' },
                { label: 'Courses', value: 'courses' },
                { label: 'Software', value: 'software' },
                { label: 'Accessories', value: 'accessories' },
              ],
              selectPlaceholder: 'Category',
              selectWidth: 138,
              inputType: 'search',
              placeholder: 'Search by name…',
              grid: { xs: 12 },
            },
          ]}
          onChange={setFilters}
        />
      </Paper>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {items.length} of {DEMO_ITEMS.length} products
        </Typography>
        {items.length < DEMO_ITEMS.length && (
          <Chip label="Filtered" size="small" color="primary" variant="outlined" />
        )}
      </Box>

      {items.length === 0 ? (
        <Paper
          variant="outlined"
          sx={{ p: 5, textAlign: 'center', borderStyle: 'dashed', borderRadius: 2 }}
        >
          <Typography color="text.secondary">No products match.</Typography>
        </Paper>
      ) : (
        <Grid container spacing={1.5}>
          {items.map((item) => (
            <Grid size={{ xs: 12, sm: 6 }} key={item.name}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Chip
                    label={item.category}
                    size="small"
                    sx={{
                      fontSize: 10,
                      bgcolor: `${CATEGORY_CHIP_COLORS[item.category]}18`,
                      color: CATEGORY_CHIP_COLORS[item.category],
                      border: `1px solid ${CATEGORY_CHIP_COLORS[item.category]}33`,
                      fontWeight: 600,
                    }}
                  />
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    ${item.price}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {item.name}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export const LiveSearchBar: Story = {
  name: 'Live search bar (FilterForm + ComboInput)',
  parameters: {
    docs: {
      description: {
        story:
          'A category+keyword ComboInput inside a FilterForm filters a live product list. No submit button, no schema — just instant reactive filtering.',
      },
    },
  },
  render: () => <LiveSearchBarRender />,
};

// ---------------------------------------------------------------------------
// Full courier booking form
// ---------------------------------------------------------------------------
function CourierFormRender() {
  const [submitted, setSubmitted] = useState<Record<string, unknown> | null>(null);
  return (
    <Box>
      <FormBuilder
        title="Book a shipment"
        fields={[
          {
            name: 'senderName',
            label: "Sender's name",
            type: FIELD_TYPE.TEXT,
            required: true,
            placeholder: 'Jane Smith',
            grid: { xs: 12, sm: 6 },
            section: 'Sender',
          },
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
            section: 'Sender',
          },
          {
            name: 'destination',
            label: 'Destination country',
            type: FIELD_TYPE.SELECT,
            required: true,
            options: [
              { label: 'United States', value: 'us' },
              { label: 'United Kingdom', value: 'uk' },
              { label: 'Germany', value: 'de' },
              { label: 'France', value: 'fr' },
              { label: 'India', value: 'in' },
              { label: 'Japan', value: 'jp' },
            ],
            grid: { xs: 12, sm: 6 },
            section: 'Package',
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
            section: 'Package',
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
            section: 'Package',
          },
          {
            name: 'serviceType',
            label: 'Service type',
            type: FIELD_TYPE.RADIO,
            required: true,
            options: [
              { label: 'Standard (5–7 days)', value: 'standard' },
              { label: 'Express (2–3 days)', value: 'express' },
              { label: 'Overnight (next day)', value: 'overnight' },
            ],
            grid: { xs: 12, sm: 6 },
            section: 'Package',
          },
        ]}
        schema={z.object({
          senderName: z.string().min(2, 'Name must be at least 2 characters'),
          phone: z.object({
            select: z.string().min(1, 'Select country code'),
            input: z.string().min(6, 'Enter a valid phone number'),
          }),
          destination: z.string().min(1, 'Select a destination'),
          weight: z.object({
            select: z.string().min(1, 'Select a unit'),
            input: z.union([z.number().min(0.01, 'Enter package weight'), z.literal('')]),
          }),
          declaredValue: z.object({
            select: z.string().min(1, 'Select a currency'),
            input: z.union([z.number().min(0.01, 'Enter declared value'), z.literal('')]),
          }),
          serviceType: z.string().min(1, 'Select a service'),
        })}
        onSubmit={(d) => setSubmitted(d)}
        onReset={() => setSubmitted(null)}
        submitText="Book shipment"
      />

      {submitted && (
        <Box sx={{ mt: 4 }}>
          <Divider sx={{ mb: 3 }} />
          <Typography variant="h6" gutterBottom>
            Booking confirmed
          </Typography>
          <Paper sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
            <pre style={{ margin: 0, fontSize: 13, overflow: 'auto' }}>
              {JSON.stringify(submitted, null, 2)}
            </pre>
          </Paper>
        </Box>
      )}
    </Box>
  );
}

export const CourierForm: Story = {
  name: 'Full form — courier booking',
  parameters: {
    docs: {
      description: {
        story:
          'A realistic order form combining three ComboInput fields: phone (code + number), declared value (currency + amount), and package weight (value + unit).',
      },
    },
  },
  render: () => <CourierFormRender />,
};
