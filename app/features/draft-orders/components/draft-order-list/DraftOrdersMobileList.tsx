import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type {
	DraftOrderListItem,
	DraftOrderListStatus,
} from '../../types/draft-order';
import { Button } from '~/shared/components/ui/Button';

interface DraftOrdersMobileListProps {
	draftOrders: DraftOrderListItem[];
	expandedOrderIds: string[];
	onToggleExpanded: (orderId: string) => void;
}

const statusClasses: Record<DraftOrderListStatus, string> = {
	draft: 'bg-[#F7F7F8] text-[#5C5C61]',
	sent: 'bg-[#FFF6E5] text-[#6B4A0B]',
	approved: 'bg-[#EEF6F1] text-[#1F7A4D]',
	workflows: 'bg-[#F7F7F8] text-[#5C5C61]',
	ready: 'bg-[#EEF6F1] text-[#1F7A4D]',
	converted: 'bg-[#EEF6F1] text-[#1F7A4D]',
	rejected: 'bg-[#FDECEC] text-[#A02020]',
	lost: 'bg-[#F7F7F8] text-[#5C5C61]',
};

export function DraftOrdersMobileList({
	draftOrders,
	expandedOrderIds,
	onToggleExpanded,
}: DraftOrdersMobileListProps) {
	const { t } = useTranslation('draftOrders');

	return (
		<div className="hidden max-[759.98px]:block">
			{draftOrders.map((draftOrder) => {
				const isExpanded = expandedOrderIds.includes(draftOrder.id);

				return (
					<div
						key={draftOrder.id}
						className={`mb-2 rounded-[12px] border border-[#ECECEE] p-3 ${isExpanded ? 'bg-[#F7F7F8]' : 'bg-white'
							}`}
					>
						<div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-3">
							<div className="min-w-0">
								<span className="block overflow-hidden text-ellipsis whitespace-nowrap text-[13px] text-[#111113]">
									<b className="font-semibold">{draftOrder.id}</b>

									{draftOrder.version !== undefined && (
										<span className="ml-1 text-xs text-[#6B6B70]">
											{t('draftOrders.page.list.version', {
												version: draftOrder.version,
											})}
										</span>
									)}
								</span>
							</div>

							<div className="text-right">
								<span className="whitespace-nowrap text-[13.5px] font-semibold text-[#111113] tabular-nums">
									{t('draftOrders.page.list.money', {value: draftOrder.amount})}
								</span>
							</div>

							<div className="col-span-2 min-w-0">
								<div className="flex min-w-0 flex-col">
									<span className="overflow-hidden text-ellipsis whitespace-nowrap text-[13px] text-[#111113]">
										{draftOrder.customer}
									</span>

									{draftOrder.description && (
										<span className="overflow-hidden text-ellipsis whitespace-nowrap text-xs leading-[1.5] text-[#6B6B70]">
											{draftOrder.description}
										</span>
									)}
								</div>
							</div>

							<div>
								<span
									className={`inline-flex h-[22px] items-center rounded-full px-2 text-xs font-medium ${statusClasses[draftOrder.status]}`}
								>
									{t(`draftOrders.page.list.statuses.${draftOrder.status}`)}
								</span>
							</div>

							<div className="flex justify-end">
								<span className="inline-flex items-center gap-[3px]">
									{draftOrder.workflow.map((stage) => (
										<span
											key={stage.code}
											className={`h-2 w-2 rounded-full border ${stage.status === 'passed'
												? 'border-[#111113] bg-[#111113]'
												: stage.status === 'active'
													? 'border-2 border-[#111113] bg-white'
													: stage.status === 'blocked'
														? 'border-[#A02020] bg-[#A02020]'
														: stage.status === 'na'
															? 'border-dashed border-[#D7D7DA] bg-white'
															: 'border-[#D7D7DA] bg-white'
												}`}
										/>
									))}
								</span>
							</div>

							<div className="col-span-2 flex justify-end">
								<Button
									type="button"
									variant="ghost"
									size="icon"
									shape="pill"
									disabled
									aria-expanded={isExpanded}
									aria-label={t('draftOrders.page.list.table.showDetails', {
										id: draftOrder.id,
									})}
									onClick={() => onToggleExpanded(draftOrder.id)}
									className="h-8 w-8 data-disabled:pointer-events-auto data-disabled:cursor-not-allowed rounded-full bg-transparent text-[#6B6B70]"
								>
									<ChevronDown
										aria-hidden="true"
										className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''
											}`}
										strokeWidth={1.8}
									/>
								</Button>
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
}