import type {ReactNode} from 'react';
import {useTranslation} from 'react-i18next';

interface SequenceRow {
  element: string;
  screenNumber: number;
  inkKey: string;
  color: string;
}

interface HeaderCellProps {
  children: ReactNode;
}

interface CellProps {
  children: ReactNode;
  className?: string;
}

const sequenceRows: SequenceRow[] = [
  {
    element: '00100',
    screenNumber: 1,
    color: '#F3F2ED',
    inkKey: 'whiteBase',
  },
  {
    element: '00200',
    screenNumber: 2,
    color: '#17345D',
    inkKey: 'navy',
  },
  {
    element: '00300',
    screenNumber: 3,
    color: '#D49D00',
    inkKey: 'gold',
  },
  {
    element: '00400',
    screenNumber: 4,
    color: '#18181B',
    inkKey: 'black',
  },
];

export default function ColorSequencesTab() {
  const {t} = useTranslation('productCardDrawer');
  return (
    <section
      aria-label={t('colorSequences.ariaLabel')}
      className="pb-6"
    >
      {/* Information Banner */}
      <div className="rounded-[15px] border border-[#ECD9A7] bg-[#FCF6E5] px-[18px] py-[8px] text-[#865B0D]">
        <p className="!text-[12px]">
          <strong
            id="color-sequences-heading"
            className="font-semibold"
          >
            {t('colorSequences.bannerTitle')}
          </strong>{' '}
          {t('colorSequences.bannerDescription')}
        </p>
      </div>

      {/* Sequence 1 */}
      <section
        aria-labelledby="sequence-one-heading"
        className="mt-[12px] rounded-[15px] border border-[#E7E7E9] bg-white px-[19px] pb-[15px] pt-[17px]"
      >
        <div className="mb-[13px] flex items-center justify-between px-4">
          <h3
            id="sequence-one-heading"
            className="text-[14px] font-semibold text-[#17171A]"
          >
            {t('colorSequences.sequenceTitle', {number: 1, code: 'X4'})}
          </h3>

          <span className="rounded-full bg-[#EAF2ED] px-[12px] py-[5px] text-[10px] font-semibold text-[#3D6B55]">
            {t('colorSequences.active')}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead className="bg-[#FAFAF9]">
              <tr className="border-b border-[#E9E9EA] text-[9px]">
                <HeaderCell>{t('colorSequences.headers.element')}</HeaderCell>
                <HeaderCell>{t('colorSequences.headers.screen')}</HeaderCell>
                <HeaderCell>{t('colorSequences.headers.description')}</HeaderCell>
                <HeaderCell>{t('colorSequences.headers.inkColor')}</HeaderCell>
              </tr>
            </thead>

            <tbody>
              {sequenceRows.map((row) => (
                <tr
                  key={row.element}
                  className="border-b border-[#EEEEEF] !text-[10px] last:border-b-0"
                >
                  <Cell>{row.element}</Cell>

                  <Cell>{t('colorSequences.screen', {number: row.screenNumber})}</Cell>

                  <Cell className="text-[#686870]">
                    {t('colorSequences.rowDescription', {number: row.screenNumber})}
                  </Cell>

                  <Cell>
                    <span className="inline-flex items-center gap-[9px]">
                      <span
                        aria-hidden="true"
                        className="h-[21px] w-[21px] rounded-[7px] border border-black/10"
                        style={{
                          backgroundColor: row.color,
                        }}
                      />

                      {t(`colorSequences.inks.${row.inkKey}`)}
                    </span>
                  </Cell>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-[11px] !pl-3 text-[9px] text-[#909098]">
          {t('colorSequences.screenCount', {count: sequenceRows.length})}
        </p>
      </section>
    </section>
  );
}

/* ===============================================================
   HEADER CELL
=============================================================== */

function HeaderCell({
  children,
}: HeaderCellProps) {
  return (
    <th className="px-[20px] py-[12px] text-[9px] font-semibold uppercase tracking-[0.04em] text-[#91919A]">
      {children}
    </th>
  );
}

/* ===============================================================
   TABLE CELL
=============================================================== */

function Cell({
  children,
  className = '',
}: CellProps) {
  return (
    <td
      className={`px-[20px] py-[8px] text-[11px] text-[#27272B] ${className}`}
    >
      {children}
    </td>
  );
}
