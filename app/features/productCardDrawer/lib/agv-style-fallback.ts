import type {AgvStyleData} from '../types';

export const AGV_STYLE_FALLBACK: AgvStyleData = {
  colorRows: [
    {
      id: 'white',
      swatch: '#f0efe9',
      tonalLightKey: 'standardInk',
      tonalDarkKey: 'whiteBaseInk',
      colorOnColorKey: 'tonalInk',
    },
    {
      id: 'navy',
      swatch: '#13294B',
      tonalLightKey: 'pmsMatch',
      tonalDarkKey: 'whiteBaseInk',
      colorOnColorKey: 'tonalNavy',
    },
  ],
  locations: [
    {
      id: 'fcc',
      sizeKey: 'max12',
    },
    {
      id: 'lc',
      sizeKey: 'max4',
    },
  ],
  methods: ['p1', 'p2', 'x1', 'by', 'cp4'],
  notes: ['note1', 'note2', 'note3'],
};
