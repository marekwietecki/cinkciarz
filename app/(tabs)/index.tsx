import { ActivityIndicator, StyleSheet, TouchableOpacity, View, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../../contexts/themeContext';
import { LanguageContext } from '../../contexts/languageContext';
import { useFocusEffect, useRouter } from 'expo-router';
import { Fonts } from '../_layout';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CurrencyWalletCard } from '@/components/CurrencyWalletCard';
import { HistoricTransaction, TransactionExtended } from '@/components/HistoricTransaction';
import currenciesJson from '../../backend/currencies.json';

const AVATAR_KEY = 'userAvatar';
const BASE_URL = 'http://192.168.18.9:4000/api';
const AUTH_TOKEN_KEY = 'userToken';


interface CurrencyWalletCardProps {
  id: number;
  wallet_id: number;
  currency: string; 
  amount: number;      
}

export default function WalletScreen() {
  const router = useRouter();
  const { strings } = useContext(LanguageContext);
  const { theme } = useContext(ThemeContext);
  
  const [ avatar, setAvatar ] = useState('');
  const [ loading, setLoading ] = useState(false);
  const [ wallets, setWallets ] = useState<CurrencyWalletCardProps[]>([]);
  const [ history, setHistory ] = useState<TransactionExtended[]>([]);
  
  const loadAvatar = useCallback(async () => {
    try {
      const storedAvatar = await AsyncStorage.getItem(AVATAR_KEY);
      setAvatar(storedAvatar || '');
    } catch (e) {
      console.error('Błąd ładowania avatara:', e);
    }
  }, []);

  const fetchWallets = useCallback(async () => {
    try {
      setLoading(true);
      const userToken = await AsyncStorage.getItem('userToken');
      
      const response = await fetch(`${BASE_URL}/wallet`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("SUROWE DANE Z SERWERA:", data); // Test
        setWallets(data);
      } else {
        console.error('Błąd pobierania portfeli');
      }
    } catch (error) {
      console.error('Błąd sieci:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const ensureWallet = async () => {
    const userToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    if (!userToken) return;

    const response = await fetch(`${BASE_URL}/wallet/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 201) {
      console.log("Wallet created");
    } else if (response.status === 400) {
      console.log("Wallet already exists");
    }
  };

  const loadHistory = useCallback(async () => {
    try {
      await ensureWallet();
      const userToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);

      if (!userToken) {
        console.warn("Brak tokena, użytkownik prawdopodobnie niezalogowany");
        return;
      }

      const response = await fetch(`${BASE_URL}/wallet/history`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.log("Status błędu:", response.status);
        throw new Error('Błąd pobierania');
      }

      const rawTransactions = await response.json();
      console.log("HISTORIA Z SERWERA:", rawTransactions); // Test  
      const enhancedHistory = rawTransactions.map((tx: any) => {
        // Szukamy info tylko jeśli kod waluty istnieje
        const fromInfo = tx.from_currency 
          ? currenciesJson.find(c => c.code === tx.from_currency) 
          : null;
          
        const toInfo = tx.to_currency 
          ? currenciesJson.find(c => c.code === tx.to_currency) 
          : null;

        return {
          ...tx,
          // Jeśli fromInfo nie istnieje (bo to wpłata), dajemy pusty string lub ikonę portfela
          fromFlag: fromInfo?.flag || (tx.type === 'deposit' ? '🏦' : '🏳️'),
          toFlag: toInfo?.flag || '🏳️',
        };
      });
        
      setHistory(enhancedHistory.slice(0, 2));
      } catch (e) {
        console.error("Błąd historii:", e);
      }
  }, []);
  
  useFocusEffect(
    useCallback(() => {
      loadAvatar();
      fetchWallets();
      loadHistory();
    }, [loadAvatar, fetchWallets, loadHistory])
  );

  return (
    <View style={[
          styles.container,
          { backgroundColor: theme.background }
        ]}>
      <TouchableOpacity style={[styles.profileLink, { backgroundColor: theme.veryLowContrast }]} onPress={() => router.push('../profile')}>
        <ThemedText type="titleSmall">{avatar}</ThemedText>
      </TouchableOpacity>
      <ThemedText
        type="titleMid"
        style={[{fontFamily: Fonts.bold, color: theme.highContrast}, styles.title]}>
        {strings.wallet_title}
      </ThemedText>
      <TouchableOpacity onPress={() => router.push('./auth/register')}>
        <ThemedText type='titleMid' style={{color: theme.highContrast}}>Register</ThemedText>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('./auth/login')}>
        <ThemedText type='titleMid' style={{color: theme.highContrast}}>Login</ThemedText>
      </TouchableOpacity>
      <ScrollView
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ 
          paddingHorizontal: '4%', 
          paddingVertical: 24 
        }}
      >
        {loading ? (
          <ActivityIndicator color={theme.highContrast} />
        ) : wallets.filter(w => (w.amount ?? 0) > 0).length > 0 ? ( 
          wallets
            .filter(wallet => (wallet.amount ?? 0) > 0) 
            .map((wallet, index, array) => (
              <React.Fragment key={wallet.id}>
                <CurrencyWalletCard
                  wallet_id={wallet.wallet_id}
                  id={wallet.id}
                  currency_code={wallet.currency}
                  balance={wallet.amount}
                />
                {index < array.length - 1 && (
                  <View 
                    style={{
                      width: 1,
                      height: 40, 
                      backgroundColor: theme.midContrast, 
                      opacity: 0.2, 
                      alignSelf: 'flex-start',
                      marginTop: '4%',
                      marginHorizontal: 10 
                    }} 
                  />
                )}
              </React.Fragment>
            ))
        ) : (
          <ThemedText style={{ color: theme.highContrast, textAlign: 'center' }}>
            Nie masz jeszcze żadnych środków.
          </ThemedText>
        )}
      </ScrollView>
      
      <ThemedText
        type="titleSmall"
        style={[{fontFamily: Fonts.bold, color: theme.highContrast}, styles.title]}>
        {strings.wallet_history}
      </ThemedText>
      <View style={{ width: '100%', alignItems: 'stretch' }}>
        {history.length > 0 ? (
          history.map((tx, index) => (
            /* Zmieniamy Fragment na View ze stylem stretch */
            <View key={tx.id} style={{ alignSelf: 'stretch', width: '100%' }}>
              <HistoricTransaction transaction={tx} />
              
              {index === 0 && history.length > 1 && (
                <View style={{
                  height: 1,
                  width: '64%',
                  backgroundColor: theme.lowContrast,
                  opacity: 0.15,
                  alignSelf: 'center',
                  marginVertical: 4
                }} />
              )}
            </View>
          ))
        ) : (
          <ThemedText style={{ textAlign: 'center', opacity: 0.5 }}>Brak transakcji</ThemedText>
        )}
      </View>
      <TouchableOpacity onPress={() => router.push('./history')}>
        <ThemedText type='textSmall' style={[ styles.historyLink, {color: theme.lowContrast}]}>
          {strings.wallet_history_link}
        </ThemedText>
      </TouchableOpacity> 
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: '4%',
    paddingTop: '32%',
  },
  profileLink: {
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 50,
    position: 'absolute', 
    top: '11%', 
    right: '8%',
  },
  title: {
    alignSelf: 'flex-start', 
    paddingLeft: '6%', 
    marginBottom: '6%',
    marginTop: '2%',
  },
  historyLink: {
    textDecorationLine: 'underline',
    marginBottom: '6%',
  },
});
