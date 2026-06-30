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

  it('marks step as completed (clickable in Stepper) after Next is clicked', async () => {
    const user = userEvent.setup();
    renderWithTheme(<FormWizard steps={steps} schema={schema} onSubmit={vi.fn()} />);
    await user.type(screen.getByLabelText('First Name'), 'Alice');
    await user.type(screen.getByLabelText('Last Name'), 'Smith');
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await waitFor(() => expect(screen.getByLabelText('Email')).toBeInTheDocument());
    // After advancing, the 'Personal' step label is wrapped in a <button> (StepButton)
    const personalLabel = screen.getByText('Personal');
    expect(personalLabel.closest('button')).not.toBeNull();
  });

  it('allows jumping back to a completed step by clicking its label', async () => {
    const user = userEvent.setup();
    renderWithTheme(<FormWizard steps={steps} schema={schema} onSubmit={vi.fn()} />);
    await user.type(screen.getByLabelText('First Name'), 'Alice');
    await user.type(screen.getByLabelText('Last Name'), 'Smith');
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await waitFor(() => expect(screen.getByLabelText('Email')).toBeInTheDocument());
    // Click the 'Personal' step label (now a StepButton) to jump back
    const personalLabel = screen.getByText('Personal');
    const stepButton = personalLabel.closest('button') as HTMLButtonElement;
    await user.click(stepButton);
    await waitFor(() => expect(screen.getByLabelText('First Name')).toBeInTheDocument());
  });

  it('does not make future incomplete steps clickable', async () => {
    renderWithTheme(<FormWizard steps={steps} schema={schema} onSubmit={vi.fn()} />);
    // On step 1, the 'Contact' step label should NOT be inside a <button>
    const contactLabel = screen.getByText('Contact');
    expect(contactLabel.closest('button')).toBeNull();
  });

  it('clears step errors when navigating back so the target step starts clean', async () => {
    const user = userEvent.setup();
    renderWithTheme(<FormWizard steps={steps} schema={schema} onSubmit={vi.fn()} />);
    await user.type(screen.getByLabelText('First Name'), 'Alice');
    await user.type(screen.getByLabelText('Last Name'), 'Smith');
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await waitFor(() => expect(screen.getByLabelText('Email')).toBeInTheDocument());
    // Trigger validation error on step 2
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(screen.getByText('Invalid email')).toBeInTheDocument());
    // Navigate back — errors should be cleared
    await user.click(screen.getByRole('button', { name: 'Back' }));
    await waitFor(() => expect(screen.getByLabelText('First Name')).toBeInTheDocument());
    // Navigate forward again — no stale errors from the previous visit
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await waitFor(() => expect(screen.getByLabelText('Email')).toBeInTheDocument());
    expect(screen.queryByText('Invalid email')).not.toBeInTheDocument();
  });

  it('clears errors when jumping to a completed step via Stepper click', async () => {
    const user = userEvent.setup();
    renderWithTheme(<FormWizard steps={steps} schema={schema} onSubmit={vi.fn()} />);
    await user.type(screen.getByLabelText('First Name'), 'Alice');
    await user.type(screen.getByLabelText('Last Name'), 'Smith');
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await waitFor(() => expect(screen.getByLabelText('Email')).toBeInTheDocument());
    // Trigger errors then jump back via Stepper
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(screen.getByText('Invalid email')).toBeInTheDocument());
    const personalBtn = screen.getByText('Personal').closest('button') as HTMLButtonElement;
    await user.click(personalBtn);
    await waitFor(() => expect(screen.getByLabelText('First Name')).toBeInTheDocument());
    // Advance again — no stale contact-step errors
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await waitFor(() => expect(screen.getByLabelText('Email')).toBeInTheDocument());
    expect(screen.queryByText('Invalid email')).not.toBeInTheDocument();
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

  it('navigates to the step containing the first error when full-form submit validation fails', async () => {
    const user = userEvent.setup();

    // Schema with conditional cross-field validation: values must match, but
    // only when confirm is non-empty. This lets trigger(['value']) on step 1
    // pass (confirm is still '' at that point), while the full handleSubmit
    // validation fails when both are filled with different values.
    const matchSchema = z
      .object({ value: z.string().min(1), confirm: z.string().min(1) })
      .refine((d) => !d.confirm || d.value === d.confirm, {
        message: 'Values must match',
        path: ['value'],
      });
    const matchSteps = [
      { label: 'Step 1', fields: [{ name: 'value', label: 'Value', type: FIELD_TYPE.TEXT }] },
      { label: 'Step 2', fields: [{ name: 'confirm', label: 'Confirm', type: FIELD_TYPE.TEXT }] },
    ];

    renderWithTheme(<FormWizard steps={matchSteps} schema={matchSchema} onSubmit={vi.fn()} />);

    await user.type(screen.getByLabelText('Value'), 'Alice');
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await waitFor(() => expect(screen.getByLabelText('Confirm')).toBeInTheDocument());

    // Type a different value — cross-field refine will fail on submit
    await user.type(screen.getByLabelText('Confirm'), 'Bob');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    // The refine error is on 'value' which lives on step 1.
    // handleSubmitError must navigate back to step 1.
    await waitFor(() => expect(screen.getByLabelText('Value')).toBeInTheDocument());
    expect(screen.getByText('Values must match')).toBeInTheDocument();
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

describe('FormWizard — title', () => {
  it('renders the title when provided', () => {
    renderWithTheme(
      <FormWizard steps={steps} schema={schema} onSubmit={vi.fn()} title="My Wizard" />,
    );
    expect(screen.getByText('My Wizard')).toBeInTheDocument();
  });

  it('renders title inside the form by default (titlePosition=inside)', () => {
    const { container } = renderWithTheme(
      <FormWizard steps={steps} schema={schema} onSubmit={vi.fn()} title="Inside Title" />,
    );
    const form = container.querySelector('form');
    expect(form?.textContent).toContain('Inside Title');
  });

  it('renders title above the form when titlePosition=above', () => {
    const { container } = renderWithTheme(
      <FormWizard
        steps={steps}
        schema={schema}
        onSubmit={vi.fn()}
        title="Above Title"
        titlePosition="above"
      />,
    );
    const form = container.querySelector('form');
    expect(form?.textContent).not.toContain('Above Title');
    expect(screen.getByText('Above Title')).toBeInTheDocument();
  });
});

describe('FormWizard — renderActions', () => {
  it('renders custom actions and hides default buttons', () => {
    renderWithTheme(
      <FormWizard
        steps={steps}
        schema={schema}
        onSubmit={vi.fn()}
        renderActions={({ next, isLastStep }) =>
          isLastStep ? (
            <button type="submit">My Submit</button>
          ) : (
            <button type="button" onClick={next}>
              My Next
            </button>
          )
        }
      />,
    );
    expect(screen.getByRole('button', { name: 'My Next' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument();
  });

  it('passes wizard context (activeStep, isFirstStep, isLastStep) to renderActions', () => {
    const renderFn = vi.fn(() => <span>custom</span>);
    renderWithTheme(
      <FormWizard steps={steps} schema={schema} onSubmit={vi.fn()} renderActions={renderFn} />,
    );
    expect(renderFn).toHaveBeenCalledWith(
      expect.objectContaining({
        isSubmitting: false,
        isFirstStep: true,
        isLastStep: false,
        activeStep: 0,
        next: expect.any(Function),
        back: expect.any(Function),
        submit: expect.any(Function),
      }),
    );
  });
});
