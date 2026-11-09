import { useLocation, useNavigate } from 'react-router';
import type { SpectrumGarment } from '../artDesign/types/artDesign';
import { SpectrumHeader } from './components/SpectrumHeader';
import { useStore } from 'zustand';
import { createElement, useMemo, useRef, useState } from 'react';
import { spectrumDrawerStore } from '~/store/spectrum-drawer.store';
import { SpectrumGarmentDrawer } from '../spectrumGarmentDrawer/components/SpectrumDrawer';
import {
  getSavedNeededByDate,
  saveNeededByDate,
  startOfDay,
} from '../artDesign/lib/artDesign';


export function ArtDesignSpectrum() {
  const location = useLocation();
  const navigate = useNavigate();
  const spectrumFrameRef = useRef<HTMLIFrameElement | null>(null);
  const spectrumDrawerOpen = useStore(
    spectrumDrawerStore,
    (state) => state.isOpen,
  );

  const openSpectrumDrawer = useStore(
    spectrumDrawerStore,
    (state) => state.open,
  );

  const closeSpectrumDrawer = useStore(
    spectrumDrawerStore,
    (state) => state.close,
  );

  const initialGarment = (
    location.state as { garment?: SpectrumGarment } | null
  )?.garment;

  const [garment, setGarment] = useState<SpectrumGarment | null>(
    initialGarment ?? null,
  );

  const today = useMemo(() => startOfDay(new Date()), []);

  const [selectedDate, setSelectedDate] = useState<Date | null>(
    () => getSavedNeededByDate(),
  );

  const handleDateChange = (date: Date) => {
    const normalizedDate = startOfDay(date);
    setSelectedDate(normalizedDate);
    saveNeededByDate(normalizedDate);
  };

  const handleSpectrumReload = () => {
    const frame = spectrumFrameRef.current;
    if (!frame) {
      return;
    }
    const currentSrc = frame.src;
    frame.src = currentSrc;
  };

  if (!garment) {
    return null;
  }

  const spectrumUrl = `https://cdn-staging.spectrumcustomizer.com/unrivaled/frontend/index.html?sku=${encodeURIComponent(
    garment.spectrumSku,
  )}`;

  return (
    <section className="@container/spectrum flex h-full min-h-0 flex-col bg-[#F7F7F8]">
      <SpectrumHeader
        garment={garment}
        spectrumUrl={spectrumUrl}
        selectedDate={selectedDate}
        today={today}
        onDateChange={handleDateChange}
        onBack={() => void navigate('/artDesign')}
        onChangeProduct={openSpectrumDrawer}
        onReload={handleSpectrumReload}
      />
      <main className="relative min-h-0 flex-1 bg-white">
        {createElement('iframe', {
          ref: spectrumFrameRef,
          id: 'spectrum-frame',
          src: spectrumUrl,
          title: `Spectrum Customizer: ${garment.name}`,
          allow: 'clipboard-write; fullscreen',
          loading: 'eager',
          className:
            'absolute inset-0 block h-full w-full border-0 bg-white',
        })}
      </main>
      <SpectrumGarmentDrawer
        open={spectrumDrawerOpen}
        onClose={closeSpectrumDrawer}
        initialGarment={garment}
        onContinue={(selectedGarment) => {
          setGarment(selectedGarment);
          closeSpectrumDrawer();
        }}
      />
    </section>
  );
}

export default ArtDesignSpectrum;