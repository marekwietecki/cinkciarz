import React, { useContext } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { ThemedText } from './themed-text'; 
import { ThemeContext } from '../contexts/themeContext';

interface CurrencyCardProps {
    name: string;
    code: string;
    symbol: string;
    flag: string;
    currentRate: number;   
    trend: number;                 
}


export function CurrencyCard({ name, code, symbol, flag, currentRate, trend }: CurrencyCardProps) {
    const { theme } = useContext(ThemeContext);
  
    const getTrendColor = (trendValue: number) => {
        if (Math.abs(trendValue) < 0.5) return theme.midContrast; 
        return trendValue > 0 ? theme.success : theme.failure; 
    };

    return (
        <TouchableOpacity style={[styles.card, { backgroundColor: theme.veryLowContrast }]}>
            <View style={styles.row}>
                <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>                        
                    <ThemedText type="titleBig" style={{ color: theme.midContrast }}>{flag}</ThemedText>
                    <ThemedText type="titleSmall" style={{ color: theme.midContrast }}>{symbol}</ThemedText>
                </View>

                <ThemedText type="titleMid" style={{color: theme.highContrast}}>{currentRate}</ThemedText>

                <View style={{ alignItems: 'flex-end' }}>
                <ThemedText type="textSmallSemiBold" style={{ color: getTrendColor(trend) }}>
                    {trend > 0 ? `+${trend}%` : `${trend}%`}
                </ThemedText>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 28,
    marginBottom: 16,
    marginHorizontal: 16,
    alignSelf: 'stretch',
    maxWidth: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
});