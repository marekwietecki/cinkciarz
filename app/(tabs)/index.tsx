import { ActivityIndicator, StyleSheet, TouchableOpacity, View, ScrollView, FlatList } from 'react-native';
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
    if (!userToken) return;

    const response = await fetch(`${BASE_URL}/wallet/history`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const rawTransactions = await response.json();
      console.log("1. RAW DATA Z SERWERA:", rawTransactions.length, "sztuk"); //TEST
      
      const enhanced = rawTransactions
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 2)
        .map((tx: any) => {
          const fromCode = tx.from_currency?.toUpperCase();
          const toCode = tx.to_currency?.toUpperCase();

          const fromInfo = currenciesJson.find(c => c.code === fromCode);
          const toInfo = currenciesJson.find(c => c.code === toCode);

          return {
            ...tx, 
            fromFlag: fromInfo?.flag || '🏳️',
            toFlag: toInfo?.flag || '🏳️',
            from_currency: fromCode,
            to_currency: toCode,
          };
        });

      setHistory(enhanced);
    }
  } catch (error) {
    console.error("Błąd ładowania historii:", error);
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
        style={[{fontFamily: Fonts.bold, color: theme.highContrast}, styles.titleSmall]}>
        {strings.wallet_history}
      </ThemedText>
      <View style={{ width: '100%', height: 280 }}>
        <FlatList
          data={history}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false} 
          renderItem={({ item }) => (
            <View style={{ alignSelf: 'stretch', width: '100%' }}>
              <HistoricTransaction transaction={item} />
            </View>
          )}
          ItemSeparatorComponent={() => (
            <View style={{
              height: 1,
              width: '64%',
              backgroundColor: theme.lowContrast,
              opacity: 0.15,
              alignSelf: 'center',
              marginVertical: 4
            }} />
          )}
          ListEmptyComponent={() => (
            <ThemedText style={{ textAlign: 'center', opacity: 0.5, marginTop: 20 }}>
              Brak transakcji
            </ThemedText>
          )}
        />
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
  titleSmall: {
    alignSelf: 'flex-start', 
    paddingLeft: '6%', 
    marginTop: '2%',
  },
  historyLink: {
    textDecorationLine: 'underline',
    marginBottom: '6%',
  },
});
