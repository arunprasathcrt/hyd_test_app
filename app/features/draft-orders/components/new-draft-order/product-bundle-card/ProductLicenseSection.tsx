import {Plus} from 'lucide-react';
import {Button} from '~/shared/components/ui/Button';
import {smallButtonClass} from './shared';

interface Props {
  uid: string;
  shipToName: string;
  text: (key: string, options?: Record<string, unknown>) => string;
}

/** `.e125-lic`: the card's license section. */
export function ProductLicenseSection({uid, shipToName, text}: Props) {
  return (
    <section
      aria-labelledby={`${uid}-license`}
      className="mb-3 min-w-0 rounded-[10px] border border-[#ECECEE] bg-white px-3.5 py-3"
    >
      <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1.5">
        <h4
          id={`${uid}-license`}
          className="m-0 text-sm leading-[1.35] font-semibold tracking-[-0.005em] text-[#111113]"
        >
          {text('license.title')}
        </h4>
        <span className="inline-flex min-h-[22px] items-center rounded-full bg-[#F7F7F8] px-2.5 text-xs leading-[1.3] font-medium whitespace-nowrap text-[#5C5C61]">
          {text('license.skips')}
        </span>
      </div>
      <p className="m-0 mt-1 min-w-0 text-xs leading-normal text-[#6B6B70]">
        {shipToName
          ? text('license.shipTo', {name: shipToName})
          : text('license.noShipTo')}
      </p>
      <p className="m-0 mt-2.5 text-[13px] leading-normal text-[#5C5C61]">
        {text('license.none')}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
        {/* ❓ TO CONFIRM — the licensing database is not wired yet */}
        <Button type="button" variant="ghost" shape="square" disabled className={smallButtonClass}>
          <Plus size={14} aria-hidden="true" />
          <span>{text('license.add')}</span>
        </Button>
        <span className="text-xs text-[#6B6B70] tabular-nums">
          {text('license.count', {count: 0, max: 5})}
        </span>
      </div>
    </section>
  );
}
