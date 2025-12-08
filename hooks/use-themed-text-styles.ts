import { useThemeColor } from "./use-theme-color";
import { Fonts } from '../app/_layout';
import { ThemedTextProps } from "@/components/themed-text";


export function useThemedTextStyles(type: NonNullable<ThemedTextProps['type']>) {
  const highContrast = useThemeColor({}, 'highContrast');
  const midContrast = useThemeColor({}, 'midContrast');
  const lowContrast = useThemeColor({}, 'lowContrast');

  switch (type) {
    case 'titleBig':
      return { fontFamily: Fonts.semiBold, fontSize: 40, lineHeight: 60, color: highContrast };
    case 'titleMid':
      return { fontFamily: Fonts.bold, fontSize: 28, lineHeight: 42, color: highContrast };
    case 'titleSmall':
      return { fontFamily: Fonts.semiBold, fontSize: 16, lineHeight: 24, color: highContrast };
    case 'subtitle':
      return { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 21, color: midContrast };
    case 'numbersBig':
      return { fontFamily: Fonts.bold, fontSize: 32, lineHeight: 48, color: highContrast };
    case 'numbersSmall':
      return { fontFamily: Fonts.bold, fontSize: 24, lineHeight: 36, color: highContrast };
    case 'textSmall':
      return { fontFamily: Fonts.light, fontSize: 12, lineHeight: 18, color: midContrast };
     case 'textSmallSemiBold':
      return { fontFamily: Fonts.semiBold, fontSize: 12, lineHeight: 18, color: highContrast };
     case 'tiny':
      return { fontFamily: Fonts.regular, fontSize: 9, lineHeight: 12, color: lowContrast };
    default:
      return { fontFamily: Fonts.semiBold, fontSize: 18, lineHeight: 27, color: lowContrast };
  }
}
