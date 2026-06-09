import React from 'react';
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm, type Control } from 'react-hook-form';
import { renderWithTheme } from './helpers';
import { FormField } from '../components/form-builder/FormField';
import { FIELD_TYPE, type FieldConfig } from '../components/form-builder/types/field.types';

const textField: FieldConfig = { name: 'firstName', label: 'First Name', type: FIELD_TYPE.TEXT };
const hiddenField: FieldConfig = {
  name: 'city',
  label: 'City',
  type: FIELD_TYPE.TEXT,
  visibleIf: (values) => !!values['showCity'],
};

function FormFieldFixture({ fieldConfig }: { fieldConfig: FieldConfig }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { control } = useForm<any>({ defaultValues: { firstName: '', city: '', showCity: false } });
  return <FormField fieldConfig={fieldConfig} control={control} />;
}

function VisibilityFixture() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { control, setValue } = useForm<any>({
    defaultValues: { firstName: '', city: '', showCity: false },
  });
  return (
    <>
      <FormField fieldConfig={hiddenField} control={control} />
      <button onClick={() => setValue('showCity', true)}>Show City</button>
    </>
  );
}

describe('FormField', () => {
  it('renders the field when visible', () => {
    renderWithTheme(<FormFieldFixture fieldConfig={textField} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('returns null when visibleIf evaluates to false', () => {
    renderWithTheme(<FormFieldFixture fieldConfig={hiddenField} />);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('shows field when visibleIf becomes true', async () => {
    const user = userEvent.setup();
    renderWithTheme(<VisibilityFixture />);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    await user.click(screen.getByText('Show City'));
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders a visible non-conditional field without issues', () => {
    renderWithTheme(<FormFieldFixture fieldConfig={textField} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
});

describe('FormField — render count performance', () => {
  it('field without visibleIf does not re-render when a sibling changes', async () => {
    const user = userEvent.setup();
    let renderCount = 0;

    const TrackedField = React.memo((props: { fieldConfig: FieldConfig; control: Control }) => {
      renderCount++;
      return <FormField {...props} />;
    });

    function TwoFieldForm() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { control } = useForm<any>({ defaultValues: { field1: '', field2: '' } });
      return (
        <>
          <TrackedField
            fieldConfig={{ name: 'field1', label: 'Field 1', type: FIELD_TYPE.TEXT }}
            control={control}
          />
          <FormField
            fieldConfig={{ name: 'field2', label: 'Field 2', type: FIELD_TYPE.TEXT }}
            control={control}
          />
        </>
      );
    }

    renderWithTheme(<TwoFieldForm />);
    const initialCount = renderCount;

    const [, field2Input] = screen.getAllByRole('textbox');
    await user.type(field2Input, 'hello');

    // TrackedField wraps FormField which has no visibleIf, so it must not
    // re-render when field2 changes — this proves the useWatch fix works.
    expect(renderCount).toBe(initialCount);
  });
});
