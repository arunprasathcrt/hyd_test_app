import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import { ACTIVITIES } from 'mocks/customer-profile/activity';
import {Button} from '~/shared/components/ui/Button';
import type { Activity } from '../../types/activity';

const PAGE_SIZE = 20;

const getActivityDotColor = (type: Activity['type']): string => {
  switch (type) {
    case 'success':
      return 'bg-[#1F7A4D]';
    case 'pending':
      return 'bg-[#B26A00]';
    case 'neutral':
      return 'bg-[#111113]';
    case 'issue':
      return 'bg-[#A02020]';
    case 'archived':
      return 'bg-[#8E8E93]';
  }
};

export function ActivitiesTab() {
  const {t} = useTranslation('accounts');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const visibleActivities = ACTIVITIES.slice(0, visibleCount);

  function handleShowMore() {
    setVisibleCount((count) => Math.min(count + PAGE_SIZE, ACTIVITIES.length));
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-7xl">
        

        <div>
          {visibleActivities.map((activity, index) => (
            <div
              key={activity.id}
              className={`flex gap-3.5 py-[11px] items-start ${
                index !== visibleActivities.length - 1 ? 'border-b border-[#ECECEE]' : ''
              }`}
            >
              <div className="flex w-[160px] shrink-0 items-center gap-[10px] max-[520px]:w-[145px]">
                <span
                  aria-hidden="true"
                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${getActivityDotColor(
                    activity.type,
                  )}`}
                />
                <span className="text-xs font-medium text-zinc-500 tabular-nums">
                  {activity.timestamp}
                </span>
              </div>

              <div className="text-[13px] font-normal text-[#111113] flex-1 leading-relaxed tracking-[-0.005em]">
                {activity.description}
              </div>
            </div>
          ))}
        </div>

        {ACTIVITIES.length > 0 ? (
          <div className="mt-3.5 flex flex-wrap items-center justify-start gap-3 border-t border-[#ECECEE] pt-3">
            <span className="text-[12px] text-[#6B6B70]">
              {t('table.more.showing', {
                shown: visibleActivities.length,
                total: ACTIVITIES.length,
              })}
            </span>
            {visibleCount < ACTIVITIES.length ? (
              <Button
                type="button"
                variant="outline"
                size="control"
                shape="md"
                onClick={handleShowMore}
                className="cursor-pointer"
              >
                {t('table.more.showMore', {
                  count: Math.min(PAGE_SIZE, ACTIVITIES.length - visibleCount),
                })}
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
