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
  const themedStyle = useThemedTextStyles(type);

  return (
    <Text
      style={[themedStyle, style]} 
      {...rest}
    />
  );
}
