import type {ReactNode} from 'react';
import {useTranslation} from 'react-i18next';
import type {AgvStyleData} from '../../types';
import {Alert, AlertDescription, AlertTitle} from '~/shared/components/ui/Alert';
import {Badge} from '~/shared/components/ui/Badge';
import {cn} from '~/shared/utils/cn';
import {Item, ItemDescription, ItemHeader, ItemTitle} from '~/shared/components/ui/Item';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/shared/components/ui/Table';

interface AgvStyleTabProps {
  data: AgvStyleData;
}

export default function AgvStyleTab({data}: AgvStyleTabProps) {
  const {t} = useTranslation('productCardDrawer');

  return (
    <section aria-label={t('agv.ariaLabel')} className="max-w-[1560px] font-sans">
      <Alert variant="info" size="md" shape="lg" layout="inline" role="note" className="mb-4">
        <AlertTitle>{t('agv.bannerTitle')}</AlertTitle>{' '}
        <AlertDescription>{t('agv.bannerBody')}</AlertDescription>
      </Alert>

      <div className="mb-3.5 flex items-start gap-3.5">
        <div className="h-32 w-32 shrink-0 overflow-hidden rounded-[10px] border border-[#ECECEE] bg-white">
          <img
            src={t('agv.hero.imageSrc')}
            loading="lazy"
            alt={t('agv.hero.imageAlt')}
            className="h-full w-full object-cover bg-white"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-semibold text-[#111113]">{t('agv.hero.title')}</div>
          <div className="mt-1.5 text-[11px] leading-[1.7] text-[#5C5C61]">{t('agv.hero.description')}</div>
        </div>
      </div>

      <div className="mb-1 grid grid-cols-2 gap-x-12 gap-y-4 text-[11px]">
        <AgvField label={t('agv.fields.category.label')} value={t('agv.fields.category.value')} />
        <AgvField label={t('agv.fields.lob.label')} value={t('agv.fields.lob.value')} />
        <AgvField label={t('agv.fields.classification.label')} value={t('agv.fields.classification.value')} />
        <AgvField label={t('agv.fields.sizeScale.label')} value={t('agv.fields.sizeScale.value')} />
        <AgvField label={t('agv.fields.stitchFile.label')} value={t('agv.fields.stitchFile.value')} />
        <AgvField label={t('agv.fields.production.label')} value={t('agv.fields.production.value')} />
      </div>

      <SectionTitle>{t('agv.sections.colors')}</SectionTitle>
      <Table variant="outline" size="sm" wrapperClassName="mb-3" className="min-w-[700px]">
        <TableHeader>
          <TableRow>
            <TableHead>{t('agv.table.headers.color')}</TableHead>
            <TableHead>{t('agv.table.headers.tonalLight')}</TableHead>
            <TableHead>{t('agv.table.headers.tonalDark')}</TableHead>
            <TableHead>{t('agv.table.headers.colorOnColor')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.colorRows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                <span className="inline-flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="inline-block h-[15px] w-[15px] rounded-[3px] border border-black/10"
                    style={{backgroundColor: row.swatch}}
                  />
                  {t(`agv.table.rows.${row.id}.label`)}
                </span>
              </TableCell>
              <TableCell>{t(`agv.table.values.${row.tonalLightKey}`)}</TableCell>
              <TableCell>{t(`agv.table.values.${row.tonalDarkKey}`)}</TableCell>
              <TableCell>{t(`agv.table.values.${row.colorOnColorKey}`)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <SectionTitle>{t('agv.sections.locations')}</SectionTitle>
      {data.locations.map((location) => (
        <Item key={location.id} variant="outline" size="sm" className="mb-2">
          <ItemHeader>
            <ItemTitle>{t(`agv.locations.${location.id}.title`)}</ItemTitle>
            <AgvChip className="px-1.5 py-0.5 text-[9px]">
              {t(`agv.locationSizes.${location.sizeKey}`)}
            </AgvChip>
          </ItemHeader>
          <ItemDescription>{t(`agv.locations.${location.id}.description`)}</ItemDescription>
        </Item>
      ))}

      <SectionTitle>
        {t('agv.sections.validMethods')} <span className="normal-case font-medium tracking-normal text-[#8E8E93]">{t('agv.sections.validMethodsSuffix')}</span>
      </SectionTitle>
      <div className="mb-3 flex flex-wrap gap-[6px]">
        {data.methods.map((method) => (
          <AgvChip key={method}>{t(`agv.methods.${method}`)}</AgvChip>
        ))}
      </div>

      <SectionTitle>{t('agv.sections.notes')}</SectionTitle>
      {data.notes.map((note) => (
        <Alert key={note} variant="warning" size="sm" shape="md" role="note" className="mb-[7px]">
          <AlertDescription>{t(`agv.notes.${note}`)}</AlertDescription>
        </Alert>
      ))}

      <Alert variant="success" size="xs" shape="md" layout="row" role="note" className="mt-[10px]">
        <AlertTitle>{t('agv.validationGateTitle')}</AlertTitle>
        <AlertDescription>{t('agv.validationGateBody')}</AlertDescription>
      </Alert>

      <div className="mt-[10px] mb-4 text-[10px] text-[#8E8E93]">{t('agv.source')}</div>
    </section>
  );
}

function AgvField({label, value}: {label: string; value: string}) {
  return (
    <div>
      <div className="text-[9.5px] uppercase tracking-[0.12em] text-[#8E8E93]">{label}</div>
      <div className="mt-[2px] text-[12px] text-[#111113]">{value}</div>
    </div>
  );
}

function SectionTitle({children}: {children: ReactNode}) {
  return (
    <div className="mb-[8px] mt-[12px] text-[9.5px] font-semibold uppercase tracking-[0.12em] text-[#8E8E93]">
      {children}
    </div>
  );
}

function AgvChip({children, className}: {children: string; className?: string}) {
  return (
    <Badge variant="muted" className={cn('font-semibold', className)} size="sm">
      {children}
    </Badge>
  );
}
