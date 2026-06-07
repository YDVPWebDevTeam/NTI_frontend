import { t } from '@lingui/core/macro';

import { PageSectionHeader } from 'components/layout/page-section-header';
import { Button } from 'components/shadcn';

type RegistrationStageHeaderProps = {
  title: string;
  description: string;
  onStartFromBeginning?: () => void;
  showRestartButton?: boolean;
  isBusy?: boolean;
};

export function RegistrationStageHeader({
  title,
  description,
  onStartFromBeginning,
  showRestartButton,
  isBusy,
}: RegistrationStageHeaderProps) {
  return (
    <PageSectionHeader
      bordered
      eyebrow={t`ACTIVE STAGE`}
      title={title}
      description={description}
      actions={
        showRestartButton && onStartFromBeginning ? (
          <Button
            type="button"
            variant="ghost"
            onClick={onStartFromBeginning}
            disabled={isBusy}
            className="border-border text-foreground hover:bg-muted h-11 justify-center rounded-sm border px-5 text-[11px] font-semibold tracking-widest disabled:opacity-40"
          >
            {t`START FROM THE BEGINNING`}
          </Button>
        ) : null
      }
    />
  );
}
