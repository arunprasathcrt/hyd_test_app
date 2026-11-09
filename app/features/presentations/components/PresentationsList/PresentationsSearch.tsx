import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '~/shared/components/ui/Button';
import { Input } from '~/shared/components/ui/Input';

interface PresentationsSearchProps {
	value: string;
	onChange: (value: string) => void;
}

export const PresentationsSearch = ({ value, onChange }: PresentationsSearchProps) => {
	const { t } = useTranslation('presentations');
	return (
		<div
			className="relative m-0 w-full min-w-0 max-w-[520px] flex-none"
			role="search"
			aria-label={t('search.label')}
		>
			<Search
				aria-hidden="true"
				className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-utds-muted"
			/>

			<label htmlFor="presentations-search" className="sr-only">
				{t('search.label')}
			</label>

			<Input
				id="presentations-search"
				type="text"
				autoComplete="off"
				spellCheck={false}
				value={value}
				onChange={(event) => onChange(event.target.value)}
				placeholder={t('search.placeholder')}
				className="pl-[38px] pr-[38px]"
			/>

			{!value && (
				<kbd className="pointer-events-none absolute right-[10px] top-1/2 inline-block -translate-y-1/2 rounded-md border border-[#D7D7DA] bg-white px-[7px] py-[3px] text-[12px] font-medium leading-none text-[#6B6B70]">
					{t('search.shortcut')}
				</kbd>
			)}

			{!!value && (
				<Button
					type="button"
					variant="ghost"
					size="icon"
					aria-label={t('search.clear')}
					onClick={() => onChange('')}
					className="absolute right-1.5 top-1/2 size-7 -translate-y-1/2 text-[#6B6B70] hover:text-[#111113]"
				>
					×
				</Button>
			)}
		</div>
	);
};