import React, { useContext } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { ThemedText } from './themed-text'; 
import { ThemeContext } from '../contexts/themeContext';
import { ArrowUpRightIcon, ArrowDownRightIcon, ArrowRightIcon } from './Icons';

interface CurrencyRateCardProps {
    name: string;
    code: string;
    symbol: string;
    flag: string;
    currentRate: string;   
    trend: number;                 
}


export function CurrencyRateCard({ name, code, symbol, flag, currentRate, trend }: CurrencyRateCardProps) {
    const { theme } = useContext(ThemeContext);
  
    const getTrendColor = (trendValue: number) => {
        if (Math.abs(trendValue) < 0.5) return theme.midContrast; 
        return trendValue > 0 ? theme.success : theme.failure; 
    };

    const renderTrendIcon = (trendValue: number) => {
        const size = 20;

        const color = Math.abs(trendValue) < 0.5 
            ? theme.midContrast 
            : (trendValue > 0 ? theme.success : theme.failure);

        if (Math.abs(trendValue) < 0.5) {
            return <ArrowRightIcon size={size} color={color} />;
        }
        
        return trendValue > 0 
            ? <ArrowUpRightIcon size={size} color={color} /> 
            : <ArrowDownRightIcon size={size} color={color} />;
    };

    return (
        <TouchableOpacity style={[styles.card, { backgroundColor: theme.background, borderColor: theme.lowContrast }]}>
            <View style={styles.row}>
                <View style={styles.currency}>                        
                    <ThemedText type="titleMid" style={{ color: theme.midContrast }}>{flag}</ThemedText>
                    <ThemedText type="textSmallSemiBold" style={{ color: theme.midContrast  }}>
                        {symbol}
                    </ThemedText>
                </View>

                <ThemedText type="titleMid" style={{color: theme.highContrast}}>{currentRate}</ThemedText>

                <View style={{ alignItems: 'center', width: 40 }}>
                    <ThemedText>
                        {renderTrendIcon(trend)}
                    </ThemedText>
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
        paddingVertical: 20,
        paddingHorizontal: 36,
        borderRadius: 28,
        marginBottom: 20,
        marginHorizontal: 16,
        alignSelf: 'stretch',
        maxWidth: '100%',
        borderWidth: .5
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    currency: {
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 12, 
        width: 56
    },
  
});