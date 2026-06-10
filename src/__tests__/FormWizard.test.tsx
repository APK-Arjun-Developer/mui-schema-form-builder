import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { z } from 'zod';
import { renderWithTheme } from './helpers';
import { FormWizard } from '../components/form-builder/FormWizard';
import { FIELD_TYPE } from '../components/form-builder/types/field.types';

const schema = z.object({
  firstName: z.string().min(1, 'First name required'),
  lastName: z.string().min(1, 'Last name required'),
  email: z.string().email('Invalid email'),
  city: z.string().min(1, 'City required'),
});

const steps = [
  {
    label: 'Personal',
    fields: [
      { name: 'firstName', label: 'First Name', type: FIELD_TYPE.TEXT },
      { name: 'lastName', label: 'Last Name', type: FIELD_TYPE.TEXT },
    ],
  },
  {
    label: 'Contact',
    fields: [
      { name: 'email', label: 'Email', type: FIELD_TYPE.TEXT },
      { name: 'city', label: 'City', type: FIELD_TYPE.TEXT },
    ],
  },
];

describe('FormWizard — rendering', () => {
  it('renders the first step and its fields', () => {
    renderWithTheme(<FormWizard steps={steps} schema={schema} onSubmit={vi.fn()} />);
    expect(screen.getByText('Personal')).toBeInTheDocument();
    expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
  });

  it('renders a Next button on the first step', () => {
    renderWithTheme(<FormWizard steps={steps} schema={schema} onSubmit={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Submit' })).not.toBeInTheDocument();
  });

  it('renders Back and Submit on the last step', async () => {
    const user = userEvent.setup();
    renderWithTheme(<FormWizard steps={steps} schema={schema} onSubmit={vi.fn()} />);
    await user.type(screen.getByLabelText('First Name'), 'Alice');
    await user.type(screen.getByLabelText('Last Name'), 'Smith');
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
  });

  it('renders Cancel on the first step when onCancel is provided', () => {
    renderWithTheme(
      <FormWizard steps={steps} schema={schema} onSubmit={vi.fn()} onCancel={vi.fn()} />,
    );
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });
});

describe('FormWizard — navigation', () => {
  it('blocks Next when step validation fails', async () => {
    const user = userEvent.setup();
    renderWithTheme(<FormWizard steps={steps} schema={schema} onSubmit={vi.fn()} />);
    // Do not fill any fields — click Next
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await waitFor(() => expect(screen.getByText('First name required')).toBeInTheDocument());
    // Should still be on step 1
    expect(screen.getByLabelText('First Name')).toBeInTheDocument();
  });

  it('advances to next step when current step is valid', async () => {
    const user = userEvent.setup();
    renderWithTheme(<FormWizard steps={steps} schema={schema} onSubmit={vi.fn()} />);
    await user.type(screen.getByLabelText('First Name'), 'Alice');
    await user.type(screen.getByLabelText('Last Name'), 'Smith');
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await waitFor(() => expect(screen.getByLabelText('Email')).toBeInTheDocument());
  });

  it('goes back to previous step when Back is clicked', async () => {
    const user = userEvent.setup();
    renderWithTheme(<FormWizard steps={steps} schema={schema} onSubmit={vi.fn()} />);
    await user.type(screen.getByLabelText('First Name'), 'Alice');
    await user.type(screen.getByLabelText('Last Name'), 'Smith');
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await waitFor(() => expect(screen.getByLabelText('Email')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Back' }));
    await waitFor(() => expect(screen.getByLabelText('First Name')).toBeInTheDocument());
  });
});

describe('FormWizard — submission', () => {
  it('calls onSubmit with all step data after completing the wizard', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderWithTheme(<FormWizard steps={steps} schema={schema} onSubmit={onSubmit} />);
    await user.type(screen.getByLabelText('First Name'), 'Alice');
    await user.type(screen.getByLabelText('Last Name'), 'Smith');
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await waitFor(() => expect(screen.getByLabelText('Email')).toBeInTheDocument());
    await user.type(screen.getByLabelText('Email'), 'alice@example.com');
    await user.type(screen.getByLabelText('City'), 'Springfield');
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice@example.com',
      city: 'Springfield',
    });
  });

  it('respects custom nextText, backText, submitText', async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <FormWizard
        steps={steps}
        schema={schema}
        onSubmit={vi.fn()}
        nextText="Continuar"
        backText="Volver"
        submitText="Enviar"
      />,
    );
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeInTheDocument();
    await user.type(screen.getByLabelText('First Name'), 'Alice');
    await user.type(screen.getByLabelText('Last Name'), 'Smith');
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Enviar' })).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Volver' })).toBeInTheDocument();
  });
});
