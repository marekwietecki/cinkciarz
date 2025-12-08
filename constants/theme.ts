/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const gray000 = '#fff';
const gray100 = '#EBECEC';
const gray200 = '#D7D8D8';
const gray300 = '#AFB0B1';
const gray400 = '#87888A';
const gray500 = '#5D5D61';
const gray600 = '#48484B';
const gray700 = '#303032';
const gray800 = '#181819';
const gray900 = '#0C0C0D';
const gray1000 = '#000000';

const gold100 = '#FCF9EA';
const gold200 = '#F5E4B9';
const gold300 = '#EDCE87';
const gold400 = '#E5B855';
const gold500 = '#DDA223';
const gold600 = '#CA921B';
const gold700 = '#B78212';
const gold800 = '#A4720A';
const gold900 = '#906201';

export const Colors = {
  light: {
    highContrast: gray800,
    midContrast: gray600,
    lowContrast: gray300,
    background: gray100,
    accentDark: gold700,
    accentLight: gold400,
    tabIconDefault: gray400,
    tabIconSelected: gray1000,
  },
  dark: {
    highContrast: gray100,
    midContrast: gray300,
    lowContrast: gray500,
    background: gray900,
    accentDark: gold900,
    accentLight: gold600,
    tabIconDefault: gray500,
    tabIconSelected: gray100,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
