import {cn} from '~/shared/utils/cn';

interface Props {
  onTrack: boolean;
  trackTitle: string;
  body: string;
}

/** `.do112c-signbox`: the road sign's message in the open card body. */
export function ProductRoadSignBanner({onTrack, trackTitle, body}: Props) {
  return (
    <div
      role="status"
      className={cn(
        'flex min-w-0 flex-col gap-1 rounded-[10px] px-3 py-2.5 text-[12.5px] leading-normal',
        onTrack ? 'bg-[#EEF6F1] text-[#1F7A4D]' : 'bg-[#FFF6E5] text-[#6B4A0B]',
      )}
    >
      <b className="text-[13px] font-semibold">{trackTitle}</b>
      <span>{body}</span>
    </div>
  );
}
