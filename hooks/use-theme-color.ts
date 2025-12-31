import { useColorScheme } from '@/hooks/use-color-scheme';

// Definiujemy kolory bezpośrednio tutaj, zamiast je importować
const MyColors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: '#2f95dc',
    // ... dopisz swoje kolorki
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: '#fff',
    // ... dopisz swoje kolorki
  },
};

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: 'text' | 'background' | 'tint' // wpisz nazwy kluczy których używasz
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    // @ts-ignore - żeby nie walczyć z typami przez chwilę
    return MyColors[theme][colorName];
  }
}
