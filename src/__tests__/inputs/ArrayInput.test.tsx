import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { z } from 'zod';
import { renderWithTheme } from '../helpers';
import { FormBuilder } from '../../components/form-builder/FormBuilder';
import { FIELD_TYPE } from '../../components/form-builder/types/field.types';

const arraySchema = z.object({
  contacts: z.array(
    z.object({
      name: z.string().min(1, 'Name required'),
      email: z.string().email('Invalid email'),
    }),
  ),
});

const arrayFields = [
  {
    name: 'contacts',
    label: 'Contacts',
    type: FIELD_TYPE.ARRAY,
    itemFields: [
      { name: 'name', label: 'Name', type: FIELD_TYPE.TEXT },
      { name: 'email', label: 'Email', type: FIELD_TYPE.TEXT },
    ],
  },
];

describe('ArrayInput', () => {
  it('renders the Add item button', () => {
    renderWithTheme(<FormBuilder fields={arrayFields} schema={arraySchema} onSubmit={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Add item' })).toBeInTheDocument();
  });

  it('appends a new item when Add item is clicked', async () => {
    const user = userEvent.setup();
    renderWithTheme(<FormBuilder fields={arrayFields} schema={arraySchema} onSubmit={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: 'Add item' }));
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getAllByRole('textbox').length).toBe(2); // name + email
  });

  it('appends multiple items', async () => {
    const user = userEvent.setup();
    renderWithTheme(<FormBuilder fields={arrayFields} schema={arraySchema} onSubmit={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: 'Add item' }));
    await user.click(screen.getByRole('button', { name: 'Add item' }));
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getAllByRole('textbox').length).toBe(4);
  });

  it('removes an item when Remove is clicked', async () => {
    const user = userEvent.setup();
    renderWithTheme(<FormBuilder fields={arrayFields} schema={arraySchema} onSubmit={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: 'Add item' }));
    await user.click(screen.getByRole('button', { name: 'Add item' }));
    const removeButtons = screen.getAllByRole('button', { name: 'Remove' });
    await user.click(removeButtons[0]);
    expect(screen.queryByText('Item 2')).not.toBeInTheDocument();
    expect(screen.getAllByRole('textbox').length).toBe(2);
  });

  it('submits array data correctly', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderWithTheme(<FormBuilder fields={arrayFields} schema={arraySchema} onSubmit={onSubmit} />);
    await user.click(screen.getByRole('button', { name: 'Add item' }));
    const inputs = screen.getAllByRole('textbox');
    await user.type(inputs[0], 'Alice');
    await user.type(inputs[1], 'alice@example.com');
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      contacts: [{ name: 'Alice', email: 'alice@example.com' }],
    });
  });

  it('respects maxItems — hides Add button when limit reached', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <FormBuilder
        fields={[{ ...arrayFields[0], maxItems: 1 }]}
        schema={arraySchema}
        onSubmit={vi.fn()}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Add item' }));
    expect(screen.queryByRole('button', { name: 'Add item' })).not.toBeInTheDocument();
  });

  it('respects minItems — hides Remove when at minimum', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <FormBuilder
        fields={[{ ...arrayFields[0], minItems: 1 }]}
        schema={arraySchema}
        onSubmit={vi.fn()}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Add item' }));
    expect(screen.queryByRole('button', { name: 'Remove' })).not.toBeInTheDocument();
  });

  it('uses custom addLabel and removeLabel', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <FormBuilder
        fields={[{ ...arrayFields[0], addLabel: 'New contact', removeLabel: 'Delete' }]}
        schema={arraySchema}
        onSubmit={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: 'New contact' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'New contact' }));
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });
});
