import { useThemeColor } from "./use-theme-color";
import { Fonts } from '../app/_layout';
import { ThemedTextProps } from "@/components/themed-text";


export function useThemedTextStyles(type: NonNullable<ThemedTextProps['type']>) {
  const highContrast = useThemeColor({}, 'highContrast');
  const midContrast = useThemeColor({}, 'midContrast');
  const lowContrast = useThemeColor({}, 'lowContrast');

  switch (type) {
    //every font gets 1/3 extra place, so that the flags will have space
    case 'titleBig':
      return { fontFamily: Fonts.semiBold, fontSize: 40, lineHeight: 53.2, color: highContrast };
    case 'titleMid':
      return { fontFamily: Fonts.bold, fontSize: 28, lineHeight: 37.24, color: highContrast };
    case 'titleSmall':
      return { fontFamily: Fonts.semiBold, fontSize: 16, lineHeight: 21.28, color: highContrast };
    case 'subtitle':
      return { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 18.62, color: midContrast };
    case 'numbersBig':
      return { fontFamily: Fonts.bold, fontSize: 32, lineHeight: 42.56, color: highContrast };
    case 'numbersSmall':
      return { fontFamily: Fonts.bold, fontSize: 24, lineHeight: 31.92, color: highContrast };
    case 'textSmall':
      return { fontFamily: Fonts.light, fontSize: 12, lineHeight: 15.96, color: midContrast };
     case 'textSmallSemiBold':
      return { fontFamily: Fonts.semiBold, fontSize: 12, lineHeight: 15.96, color: highContrast };
     case 'tiny':
      return { fontFamily: Fonts.regular, fontSize: 9, lineHeight: 12, color: lowContrast };
    default:
      return { fontFamily: Fonts.medium, fontSize: 18, lineHeight: 24, color: lowContrast };
  }
}
