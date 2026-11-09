import { useTranslation } from 'react-i18next';
import { Card } from '~/shared/components/ui/Card';
import type { DraftOrderKpi } from '../../types/draft-order';
import { formatDraftOrderKpiValue } from '../../lib/draft-orders';

interface DraftOrdersKpisProps {
	kpis: DraftOrderKpi[];
}
export function DraftOrdersKpis({
	kpis,
}: DraftOrdersKpisProps) {
	const { t } = useTranslation('draftOrders');

	return (
		<div
			className="grid grid-cols-4 gap-3 max-[1199.98px]:grid-cols-2 max-[599.98px]:grid-cols-1"
			role="group"
			aria-label={t('draftOrders.page.list.kpis.ariaLabel')}
		>
			{kpis.map((kpi) => (
				<Card
					key={kpi.id}
					className="gap-0 border-[#ECECEE] p-4"
				>
					<div className="mb-[6px] text-xs font-medium uppercase tracking-[0.06em] text-[#6B6B70]">
						{t(`draftOrders.page.list.kpis.${kpi.id}.label`)}
					</div>
					<div className="text-[28px] font-semibold leading-[1.2] tracking-[-0.01em] text-[#111113] tabular-nums">
						{formatDraftOrderKpiValue(kpi)}
					</div>
					<div className="mt-1 text-xs leading-[1.45] text-[#6B6B70]">
						{kpi.id === 'openDraftOrderValue' &&
							t('draftOrders.page.list.kpis.openDraftOrderValue.subtext', {
								count: kpi.metadata?.count,
							})}

						{kpi.id === 'projectedRevenue' &&
							t('draftOrders.page.list.kpis.projectedRevenue.subtext', {
								rate: kpi.metadata?.rate,
							})}

						{kpi.id === 'accountsInPlay' &&
							t('draftOrders.page.list.kpis.accountsInPlay.subtext', {
								count: kpi.metadata?.count,
							})}

						{kpi.id === 'conversionRate' &&
							t('draftOrders.page.list.kpis.conversionRate.subtext', {
								converted: kpi.metadata?.converted,
								total: kpi.metadata?.total,
							})}
					</div>
				</Card>
			))}
		</div>
	);
}