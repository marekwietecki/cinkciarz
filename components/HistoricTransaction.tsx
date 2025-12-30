import React, { useContext } from "react";
import { View, StyleSheet } from "react-native";
import { ThemedText } from "./themed-text";
import { LanguageContext } from '../contexts/languageContext';
import { ThemeContext } from '../contexts/themeContext';
import { MoveRightIcon } from "./Icons";

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
  
  return (
    <View style={[styles.card, {borderColor: theme.lowContrast}]}>
      <ThemedText type="tiny" style={styles.dateText}>
        {new Date(transaction.date).toLocaleDateString()}
      </ThemedText>
      
      <View style={styles.mainSection}>
        <View style={styles.currencyAmountWrapper}>  
          <ThemedText type="titleMid" style={{ color: theme.lowContrast}}>
            {transaction.from_amount}
          </ThemedText>
          <ThemedText type="textSmall" style={{ color: theme.midContrast}}>
            {transaction.fromFlag}{transaction.from_currency}
          </ThemedText>
        </View>  
        <MoveRightIcon size={16} color={theme.lowContrast}></MoveRightIcon>
        <View style={styles.currencyAmountWrapper}>  
          <ThemedText type="titleMid" style={{ color: theme.midContrast }}>
            {'+'}{transaction.to_amount}
          </ThemedText>
          <ThemedText type="textSmall" style={{ color: theme.highContrast }}>
            {transaction.toFlag}{transaction.to_currency}
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
      justifyContent: 'space-between',
      alignItems: 'stretch',
      alignSelf: 'stretch',
      maxWidth: '90%',
    },
    mainSection: {
      alignItems: 'center',
      flex: 1,
      flexDirection: 'row',
      alignSelf: 'center',
    },
    currencyAmountWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      width: '44%',
    },
    dateText: {
      fontSize: 12,
      opacity: 0.6,
      marginTop: 4,
      alignSelf: 'center',
    },
});