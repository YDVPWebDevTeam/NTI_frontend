import { t } from '@lingui/core/macro';
import { ArrowLeft, ArrowRight } from 'lucide-react';

import { Button } from 'components/shadcn';

type RegistrationActionsProps = {
  safeCurrentStepIndex: number;
  isLastStep: boolean;
  isBusy: boolean;
  onPreviousStep: () => void;
};

const PREVIOUS_STEP_VISIBLE_FROM_INDEX = 2;

export function RegistrationActions({
  safeCurrentStepIndex,
  isLastStep,
  isBusy,
  onPreviousStep,
}: RegistrationActionsProps) {
  const submitLabel = (() => {
    if (isBusy) {
      return t`PROCESSING...`;
    }

    if (isLastStep) {
      return t`FINISH REGISTRATION`;
    }

    return t`NEXT STEP`;
  })();

  return (
    <div className="mt-9 flex flex-col-reverse gap-3 border-t border-black/[0.07] pt-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {safeCurrentStepIndex > PREVIOUS_STEP_VISIBLE_FROM_INDEX ? (
          <Button
            type="button"
            variant="ghost"
            onClick={onPreviousStep}
            disabled={isBusy}
            className="text-foreground hover:bg-muted h-11 justify-center rounded-sm border border-black/10 px-5 text-[11px] font-semibold tracking-widest disabled:opacity-40 sm:justify-start"
          >
            <ArrowLeft className="h-4 w-4" />
            {t`PREVIOUS STEP`}
          </Button>
        ) : null}
      </div>

      <Button
        type="submit"
        disabled={isBusy}
        className="bg-primary text-primary-foreground hover:bg-primary/90 h-11 rounded-sm px-7 text-[11px] font-semibold tracking-widest disabled:opacity-40"
      >
        {submitLabel}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
