import type { ComponentProps } from 'react';

import { FormSectionCard } from 'components/forms';

type RegistrationSectionCardProps = ComponentProps<typeof FormSectionCard>;

export function RegistrationSectionCard(props: RegistrationSectionCardProps) {
  return <FormSectionCard {...props} />;
}
