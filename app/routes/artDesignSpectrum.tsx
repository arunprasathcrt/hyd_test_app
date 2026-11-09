import {useTranslation} from 'react-i18next';
import type {Route} from './+types/artDesignSpectrum';

import { ArtDesignSpectrum } from '~/features/artDesignSpectrum/ArtDesignSpectrum';
export const handle = {i18n: ['artDesign', 'common', 'errors']};

export async function loader({context}: Route.LoaderArgs) {
  await context.customerAccount.handleAuthStatus();
  return null;
}

export default function ArtDesignSpectrumPage() {
  return <ArtDesignSpectrum />;
}

export function ErrorBoundary() {
  const {t} = useTranslation('errors');

  return (
    <main className="p-8 text-utds-ink">
      <h1 className="text-xl font-semibold">{t('boundary.title')}</h1>
      <p className="mt-2 text-sm text-utds-secondary">
        {t('boundary.unknown')}
      </p>
    </main>
  );
}