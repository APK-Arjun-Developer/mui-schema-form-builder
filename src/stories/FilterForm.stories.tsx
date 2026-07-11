import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Box, Chip, Divider, Paper, Stack, Typography } from '@mui/material';
import type { FieldValues } from 'react-hook-form';
import { FilterForm } from '../components/form-builder/FilterForm';
import { FIELD_TYPE } from '../components/form-builder/types/field.types';

const meta: Meta<typeof FilterForm> = {
  title: 'FilterForm',
  component: FilterForm,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A reactive filter bar that fires `onChange` on every field change. No submit button, no Zod schema required — designed for search bars, filter sidebars, and toolbar filters.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof FilterForm>;

// ---------------------------------------------------------------------------
// Basic
// ---------------------------------------------------------------------------
export const Basic: Story = {
  name: 'Basic filter bar',
  args: {
    fields: [
      {
        name: 'search',
        label: 'Search',
        type: FIELD_TYPE.TEXT,
        placeholder: 'Search...',
        grid: { xs: 12, sm: 8 },
      },
      {
        name: 'status',
        label: 'Status',
        type: FIELD_TYPE.SELECT,
        options: [
          { label: 'All statuses', value: '' },
          { label: 'Active', value: 'active' },
          { label: 'Inactive', value: 'inactive' },
        ],
        grid: { xs: 12, sm: 4 },
      },
    ],
    onChange: (values) => console.log('filters:', values),
  },
};

// ---------------------------------------------------------------------------
// Live values — shows what onChange receives
// ---------------------------------------------------------------------------
function FilterLiveValues() {
  const [filters, setFilters] = useState<FieldValues>({});
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <FilterForm
        fields={[
          {
            name: 'search',
            label: 'Search',
            type: FIELD_TYPE.TEXT,
            placeholder: 'Type to filter...',
            grid: { xs: 12, sm: 8 },
          },
          {
            name: 'category',
            label: 'Category',
            type: FIELD_TYPE.SELECT,
            options: [
              { label: 'All categories', value: '' },
              { label: 'Books', value: 'books' },
              { label: 'Electronics', value: 'electronics' },
              { label: 'Clothing', value: 'clothing' },
            ],
            grid: { xs: 12, sm: 4 },
          },
        ]}
        onChange={setFilters}
      />
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          onChange output
        </Typography>
        <pre style={{ margin: 0, fontSize: 12 }}>{JSON.stringify(filters, null, 2)}</pre>
      </Paper>
    </Box>
  );
}

export const LiveValues: Story = {
  name: 'Live values (onChange)',
  parameters: {
    docs: {
      description: {
        story:
          'Every keystroke or selection fires `onChange` with the full current filter state. The panel below reflects what your handler would receive.',
      },
    },
  },
  render: () => <FilterLiveValues />,
};

// ---------------------------------------------------------------------------
// With reset button
// ---------------------------------------------------------------------------
function FilterWithReset() {
  const [filters, setFilters] = useState<FieldValues>({});
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <FilterForm
        showReset
        fields={[
          {
            name: 'search',
            label: 'Search',
            type: FIELD_TYPE.TEXT,
            placeholder: 'Search...',
            grid: { xs: 12, sm: 6 },
          },
          {
            name: 'status',
            label: 'Status',
            type: FIELD_TYPE.SELECT,
            options: [
              { label: 'All statuses', value: '' },
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
            ],
            grid: { xs: 12, sm: 6 },
          },
        ]}
        onChange={setFilters}
      />
      <Paper variant="outlined" sx={{ p: 2 }}>
        <pre style={{ margin: 0, fontSize: 12 }}>{JSON.stringify(filters, null, 2)}</pre>
      </Paper>
    </Box>
  );
}

export const WithReset: Story = {
  name: 'With reset button',
  parameters: {
    docs: {
      description: {
        story:
          '`showReset` adds a Reset button that returns all fields to their initial default values.',
      },
    },
  },
  render: () => <FilterWithReset />,
};

// ---------------------------------------------------------------------------
// Pre-set default values
// ---------------------------------------------------------------------------
function FilterDefaultValues() {
  const [filters, setFilters] = useState<FieldValues>({});
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <FilterForm
        showReset
        defaultValues={{ search: 'react', status: 'active' }}
        fields={[
          {
            name: 'search',
            label: 'Search',
            type: FIELD_TYPE.TEXT,
            placeholder: 'Search...',
            grid: { xs: 12, sm: 6 },
          },
          {
            name: 'status',
            label: 'Status',
            type: FIELD_TYPE.SELECT,
            options: [
              { label: 'All statuses', value: '' },
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
            ],
            grid: { xs: 12, sm: 6 },
          },
        ]}
        onChange={setFilters}
      />
      <Paper variant="outlined" sx={{ p: 2 }}>
        <pre style={{ margin: 0, fontSize: 12 }}>{JSON.stringify(filters, null, 2)}</pre>
      </Paper>
    </Box>
  );
}

export const DefaultValues: Story = {
  name: 'Pre-set default values',
  parameters: {
    docs: {
      description: {
        story:
          'Pass `defaultValues` to pre-fill filter fields. The Reset button returns to these values.',
      },
    },
  },
  render: () => <FilterDefaultValues />,
};

// ---------------------------------------------------------------------------
// Multiple field types
// ---------------------------------------------------------------------------
function FilterMultipleTypes() {
  const [filters, setFilters] = useState<FieldValues>({});
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <FilterForm
        showReset
        spacing={2}
        fields={[
          {
            name: 'search',
            label: 'Keyword',
            type: FIELD_TYPE.TEXT,
            placeholder: 'Search...',
            grid: { xs: 12, sm: 4 },
          },
          {
            name: 'category',
            label: 'Category',
            type: FIELD_TYPE.SELECT,
            options: [
              { label: 'All', value: '' },
              { label: 'Books', value: 'books' },
              { label: 'Electronics', value: 'electronics' },
            ],
            grid: { xs: 12, sm: 4 },
          },
          {
            name: 'minPrice',
            label: 'Min price ($)',
            type: FIELD_TYPE.NUMBER,
            min: 0,
            grid: { xs: 6, sm: 4 },
          },
          {
            name: 'maxPrice',
            label: 'Max price ($)',
            type: FIELD_TYPE.NUMBER,
            min: 0,
            grid: { xs: 6, sm: 4 },
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
      <Paper variant="outlined" sx={{ p: 2 }}>
        <pre style={{ margin: 0, fontSize: 12 }}>{JSON.stringify(filters, null, 2)}</pre>
      </Paper>
    </Box>
  );
}

export const MultipleTypes: Story = {
  name: 'Multiple field types',
  parameters: {
    docs: {
      description: {
        story:
          'FilterForm supports the same field types as FormBuilder — text, number, select, checkbox, and more.',
      },
    },
  },
  render: () => <FilterMultipleTypes />,
};

// ---------------------------------------------------------------------------
// Embedded in a toolbar — real-world layout
// ---------------------------------------------------------------------------
const ALL_ROWS = [
  { name: 'Alice Johnson', status: 'active' },
  { name: 'Bob Smith', status: 'inactive' },
  { name: 'Carol White', status: 'active' },
  { name: 'David Brown', status: 'inactive' },
  { name: 'Eva Martinez', status: 'active' },
];

function FilterInToolbar() {
  const [filters, setFilters] = useState<FieldValues>({ search: '', status: '' });

  const rows = ALL_ROWS.filter((row) => {
    const search = String(filters.search ?? '').toLowerCase();
    const status = String(filters.status ?? '');
    return (
      (!search || row.name.toLowerCase().includes(search)) && (!status || row.status === status)
    );
  });

  return (
    <Paper variant="outlined">
      <Box sx={{ p: 2 }}>
        <FilterForm
          showReset
          fields={[
            {
              name: 'search',
              label: 'Search',
              type: FIELD_TYPE.TEXT,
              placeholder: 'Name...',
              grid: { xs: 12, sm: 8 },
            },
            {
              name: 'status',
              label: 'Status',
              type: FIELD_TYPE.SELECT,
              options: [
                { label: 'All statuses', value: '' },
                { label: 'Active', value: 'active' },
                { label: 'Inactive', value: 'inactive' },
              ],
              grid: { xs: 12, sm: 4 },
            },
          ]}
          onChange={setFilters}
        />
      </Box>
      <Divider />
      <Box sx={{ p: 2 }}>
        {rows.length === 0 ? (
          <Typography color="text.secondary" variant="body2">
            No results match the current filters.
          </Typography>
        ) : (
          <Stack spacing={1}>
            {rows.map((row) => (
              <Box
                key={row.name}
                sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <Typography variant="body2">{row.name}</Typography>
                <Chip
                  label={row.status}
                  size="small"
                  color={row.status === 'active' ? 'success' : 'default'}
                />
              </Box>
            ))}
          </Stack>
        )}
      </Box>
    </Paper>
  );
}

export const InToolbar: Story = {
  name: 'Embedded in a toolbar',
  parameters: {
    docs: {
      description: {
        story:
          'A common pattern: FilterForm sits inside a Paper toolbar that drives a live data list below it.',
      },
    },
  },
  render: () => <FilterInToolbar />,
};
