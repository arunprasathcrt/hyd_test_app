import {useTranslation} from 'react-i18next';
import type {DraftOrderStep} from '../../types/new-draft-order';
import {BuilderCard, BuilderCardTitle} from './BuilderFields';

type PendingStep = Extract<DraftOrderStep, 'products' | 'ship' | 'review'>;

interface Props {
  step: PendingStep;
}

/**
 * Shared panel used while later steps are still being wired to real controls.
 */
export function PendingStepCard({step}: Props) {
  const {t} = useTranslation('newDraftOrder');

  return (
    <BuilderCard aria-label={t(`newDraftOrder.steps.${step}.title`)}>
      <header className="mb-4">
        <BuilderCardTitle
          title={t(`newDraftOrder.steps.${step}.title`)}
          sub={t(`newDraftOrder.steps.${step}.sub`)}
        />
      </header>

      <p className="m-0 text-[13px] leading-normal text-[#5C5C61]">
        {t(`newDraftOrder.pendingSteps.${step}`)}
      </p>
    </BuilderCard>
  );
}