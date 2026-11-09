import type { ReactNode } from 'react';
import { Button } from '~/shared/components/ui/Button';
import { cn } from '~/shared/utils/cn';

export interface TabStripItem<TId extends string> {
    /** Unique tab key used by the parent, such as 'overview'. */
    id: TId;
    /** Visible translated label, such as t('tabs.overview'). */
    label: ReactNode;
    /** Disables the tab and prevents onChange. */
    disabled?: boolean;
}

export interface TabStripProps<TId extends string> {
    /** Tabs in the order they should appear. */
    tabs: TabStripItem<TId>[];
    /** ID of the currently selected tab. */
    activeTab: TId;
    /** Updates the selected tab when an enabled tab is clicked. */
    onChange: (tab: TId) => void;
    /** Optional translated accessible name for the tab list. */
    ariaLabel?: string;
    /** Extra layout classes, such as padding or margin. */
    className?: string;
}

/**
 * Reusable row of pill tabs.
 *
 * Pass translated labels and stable tab IDs. Keep activeTab in the parent and
 * render the matching tab content outside this component.
 *
 * @example
 * const tabs = [
 *   {id: 'overview', label: t('tabs.overview')},
 *   {id: 'orders', label: t('tabs.orders'), disabled: true},
 * ];
 * <TabStrip
 *   tabs={tabs}
 *   activeTab={activeTab}
 *   onChange={setActiveTab}
 *   ariaLabel={t('tabs.ariaLabel')}
 * />
 */
export function TabStrip<TId extends string>({
    tabs,
    activeTab,
    onChange,
    ariaLabel,
    className,
}: TabStripProps<TId>) {
    return (
        <div
            aria-label={ariaLabel}
            className={cn('flex shrink-0 gap-1 overflow-x-auto border-b border-utds-border-subtle', className)}
            role="tablist"
        >
            {tabs.map((tab) => (
                <Button
                    key={tab.id}
                    variant="tab"
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    onClick={() => onChange(tab.id)}
                    disabled={tab.disabled}
                >
                    {tab.label}
                </Button>
            ))}
        </div>
    );
}
