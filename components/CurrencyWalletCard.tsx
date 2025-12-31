import React, { useContext } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { ThemedText } from './themed-text'; 
import { ThemeContext } from '../contexts/themeContext';
import { Fonts } from '../app/_layout';
import currencies from '../backend/currencies.json'

interface CurrencyWalletCardProps {
    id: number;
    wallet_id: number;
    currency_code: string; 
    balance: number;      
}

const currencyMap = currencies.reduce((acc, curr) => {
  acc[curr.code] = curr;
  return acc;
}, {} as Record<string, typeof currencies[0]>);


export function CurrencyWalletCard({ id, wallet_id, currency_code, balance }: CurrencyWalletCardProps) {
    const { theme } = useContext(ThemeContext);
    const info = currencyMap[currency_code] || { flag: '🏳️', symbol: '', name: 'Waluta' };
    
    return (
        <View style={styles.balanceCard}>
            <View style={styles.rightSection}>
                <ThemedText type="numbersSmall" style={{ fontFamily: Fonts.bold, color: theme.highContrast }}>
                    {(balance ?? 0).toFixed(0)} {info.symbol}
                </ThemedText>
            </View>

            <View style={styles.lowerSection}>        
                    <ThemedText type="subtitle" style={styles.flag}>{info.flag}</ThemedText>
                    <ThemedText type="subtitle" style={{ fontFamily: Fonts.regular, color: theme.highContrast }}>
                        {currency_code}
                    </ThemedText>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
  balanceCard: {
    width: 120, 
    padding: 16,
    flex: 0,
    height: 100, 
    justifyContent: 'center',
    alignItems: "center",
    gap: 4,
  },
  lowerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flag: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 3,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
});