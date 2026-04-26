import { t } from '@lingui/core/macro';

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
    <div className="mb-7 border-b border-black/[0.07] pb-6">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-medium tracking-[0.12em] text-neutral-500">
            {t`ACTIVE STAGE`}
          </p>
          <h2 className="mt-2 text-4xl leading-tight font-semibold tracking-tight text-[#0c1a4f]">
            {title}
          </h2>
          <p className="mt-3 max-w-170 text-[16px] leading-relaxed text-neutral-600">
            {description}
          </p>
        </div>

        {showRestartButton && onStartFromBeginning && (
          <Button
            type="button"
            variant="ghost"
            onClick={onStartFromBeginning}
            disabled={isBusy}
            className="h-11 justify-center rounded-sm border border-black/10 px-5 text-[11px] font-semibold tracking-widest text-neutral-700 hover:bg-black/3 disabled:opacity-40"
          >
            {t`START FROM THE BEGINNING`}
          </Button>
        )}
      </div>
    </div>
  );
}
