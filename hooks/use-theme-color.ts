import { useColorScheme } from '@/hooks/use-color-scheme';

const MyColors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: '#2f95dc',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: '#fff',
  },
};

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: 'text' | 'background' | 'tint' 
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return MyColors[theme][colorName];
  }
}
