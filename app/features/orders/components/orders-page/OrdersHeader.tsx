import {useTranslation} from 'react-i18next';
import {DownloadIcon} from 'app/shared/components/OrdersIcons';
import {Button} from '~/shared/components/ui/Button';

export interface OrdersHeaderProps {
  filteredOrdersCount: number;
  totalOrdersCount: number;
  filteredTotalValue: number;
}

export function OrdersHeader({
  filteredOrdersCount,
  totalOrdersCount,
  filteredTotalValue,
}: OrdersHeaderProps) {
  const {t} = useTranslation('orders');
  const {t: tCommon} = useTranslation('common');

  return (
    <div
      className="
        flex
        flex-col
        justify-between
        gap-6
        min-[760px]:flex-row
        min-[760px]:items-end
      "
    >
      <div className="min-w-0 flex-1">
        <h1
          className="
            m-0
            font-sans
            text-[28px]
            font-semibold
            leading-[1.2]
            tracking-[-0.01em]
            text-[#0F0F0F]
          "
        >
          {t('page.title')}
        </h1>

        <p
          className="
            m-0
            mt-1
            font-sans
            text-[13.5px]
            font-normal
            leading-[1.5]
            text-[#8B8B8B]
          "
        >
          {t('page.subtitle', {
            shown: filteredOrdersCount,
            total: totalOrdersCount,
            amount: tCommon('format.money', {
              value: filteredTotalValue,
            }),
          })}
        </p>
      </div>

      {/* Page actions */}
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="small" disabled>
          {t('page.history')}
        </Button>

        <Button type="button" variant="outline" size="small" disabled>
          <DownloadIcon />

          {t('page.export')}
        </Button>
      </div>
    </div>
  );
}
