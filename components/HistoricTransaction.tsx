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
  
  console.log("KOMPONENT WIDZI ID:", transaction?.id, "KWOTA:", transaction?.to_amount, "Kwota2", transaction?.from_amount, "from currency", transaction?.from_currency, "to currency", transaction?.to_currency);

  if (!transaction) return null;

  return (
    <View style={[styles.card, {borderColor: theme.lowContrast}]}>
      <ThemedText type="tiny" style={styles.dateText}>
        {new Date(transaction.date).toLocaleDateString()}
      </ThemedText>
      
      <View style={styles.mainSection}>
        <View style={styles.currencyAmountWrapper}>  
          {transaction.from_amount !== null && (
            <ThemedText type="titleMid" style={{ color: theme.lowContrast }}>
              {transaction.from_amount}
            </ThemedText>
          )}
          <ThemedText type="textSmall" style={{ color: theme.lowContrast, marginTop: 3}}>
            {transaction.from_currency ? `${transaction.fromFlag} ${transaction.from_currency}` : strings.history_deposit}          
          </ThemedText>
        </View>  
        
        <MoveRightIcon size={16} color={theme.lowContrast} style={{paddingHorizontal: '4%'}}></MoveRightIcon>

        <View style={[styles.currencyAmountWrapper, {justifyContent: 'flex-end'}]}>  
          <ThemedText type="titleMid" style={{ color: theme.midContrast }}>
            {transaction.to_amount ?? '0'}          
          </ThemedText>
          <ThemedText type="textSmall" style={{ color: theme.midContrast, marginTop: 3 }}>
            {transaction.toFlag} {transaction.to_currency ?? ''}
          </ThemedText>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    card: {
      width: '100%',
      paddingVertical: 18,
      paddingHorizontal: 20,
      borderRadius: 28,
      marginBottom: 20,
      justifyContent: 'space-between',
      alignItems: 'stretch',
      alignSelf: 'stretch',
      maxWidth: '100%',
      gap: 12,
      backgroundColor: 'transparent',
    },
    mainSection: {
      alignItems: 'center',
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignSelf: 'stretch',
      width: '100%'
    },
    currencyAmountWrapper: {
      alignItems: 'center',
      flex: 1,
      paddingHorizontal: '1%',
    },
    dateText: {
      fontSize: 12,
      opacity: 0.6,
      marginTop: 4,
      alignSelf: 'center',
    },
});