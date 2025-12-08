import React from 'react';
import { Text, type TextProps } from 'react-native';
import { useThemedTextStyles } from '@/hooks/use-themed-text-styles';

export type ThemedTextProps = TextProps & {
  type?:
    | 'default'
    | 'titleBig'
    | 'titleMid'
    | 'titleSmall'
    | 'subtitle'
    | 'numbersBig'
    | 'numbersSmall'
    | 'textSmall'
    | 'textSmallSemiBold'
    | 'tiny';
};

export function ThemedText({
  style,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  // pobieramy styl z hooka
  const themedStyle = useThemedTextStyles(type);

  return (
    <Text
      style={[themedStyle, style]} // łączymy styl z hooka + ewentualny dodatkowy styl z propsów
      {...rest}
    />
  );
}
