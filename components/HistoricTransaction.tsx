import React, { useContext } from "react";
import { View, StyleSheet } from "react-native";
import { ThemedText } from "./themed-text";
import { LanguageContext } from '../contexts/languageContext';
import { ThemeContext } from '../contexts/themeContext';

export interface TransactionExtended extends Transaction {
  fromFlag: string;
  toFlag: string;
}

export interface Transaction {
  id: number;
  wallet_id: number;
  type: 'BUY' | 'SELL' | 'EXCHANGE'; 
  from_currency: string;
  to_currency: string;
  from_amount: number;
  to_amount: number;
  rate: number;
  date: string; 
}

export const HistoricTransaction = ({ transaction }: { transaction: TransactionExtended }) => {
  const { strings } = useContext(LanguageContext);
  const { theme } = useContext(ThemeContext);
  
  const isBuy = transaction.type === 'BUY';
  
  return (
    <View style={[styles.card, {borderColor: theme.lowContrast}]}>
      <View style={styles.row}>
        <View style={styles.leftSection}>
          <ThemedText style={styles.typeText}>
            {transaction.type === 'BUY' ? '📥 Kupno' : transaction.type === 'SELL' ? '📤 Sprzedaż' : '🔄 Wymiana'}
          </ThemedText>
          <ThemedText style={styles.dateText}>{new Date(transaction.date).toLocaleDateString()}</ThemedText>
        </View>
        
        <View style={styles.rightSection}>
          <ThemedText style={[styles.amountText, { color: isBuy ? '#4CAF50' : '#FF5252' }]}>
            {isBuy ? '+' : '-'}{transaction.to_amount} {transaction.to_currency} {transaction.toFlag}
          </ThemedText>
          <ThemedText style={styles.subAmountText}>
            {transaction.from_amount} {transaction.from_currency} {transaction.fromFlag}
          </ThemedText>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    card: {
      paddingVertical: 18,
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
    leftSection: {
      flex: 1,
    },
    rightSection: {
      alignItems: 'flex-end',
      flex: 1,
    },
    typeText: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    dateText: {
      fontSize: 12,
      opacity: 0.6,
      marginTop: 4,
    },
    amountText: {
      fontSize: 16,
      fontWeight: '700',
    },
    subAmountText: {
      fontSize: 12,
      opacity: 0.5,
      marginTop: 4,
    }
});