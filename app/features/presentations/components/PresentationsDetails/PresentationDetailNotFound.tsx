import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const PresentationDetailNotFound = () => {
  const { t } = useTranslation('presentations');
  return (
    <div className="h-full min-h-0 overflow-y-auto bg-white">
      <div className="mx-auto flex min-h-full w-full max-w-[1264px] flex-col px-4 pb-8 pt-6 sm:px-6 md:px-8 lg:pt-12">
        <section className="mx-auto max-w-[440px] px-5 pb-10 pt-14 text-center">
          <h1 className="mb-1.5 text-[16px] font-semibold tracking-[-0.01em] text-[#111113]">
            {t('detail.notFound.title')}
          </h1>

          <p className="mb-4 text-[13px] leading-[1.5] text-[#5C5C61]">
            {t('detail.notFound.description')}
          </p>

          <Link
            to="/presentations"
            className="inline-flex h-9 items-center rounded-[10px] border border-[#D7D7DA] bg-white px-[14px] text-[13px] font-medium text-[#111113] no-underline transition-colors hover:bg-[#F7F7F8] hover:no-underline"
          >
            {t('detail.notFound.action')}
          </Link>
        </section>
      </div>
    </div>
  )
}