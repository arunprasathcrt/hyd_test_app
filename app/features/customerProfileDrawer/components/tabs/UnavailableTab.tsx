import {useTranslation} from 'react-i18next';
import type {CustomerProfileTab} from '../../types';

export interface UnavailableTabProps {
  tab: CustomerProfileTab;
}

/** Products, Artwork, Team, Comments, and Activity tabs — not served yet. */
export function UnavailableTab({tab}: UnavailableTabProps) {
  const {t} = useTranslation('accounts');

  return (
    <div className="rounded-xl border border-dashed border-[#D9D9DE] bg-[#FAFAFA] p-6 text-center text-sm text-[#8B8B8B]">
      <p className="mb-1 font-medium text-[#5C5C61]">
        {t(`drawer.panels.${tab}.title`)}
      </p>
      <p>{t(`drawer.panels.${tab}.unavailable`)}</p>
    </div>
  );
}
