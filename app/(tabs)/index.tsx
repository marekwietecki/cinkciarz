import { CurrencyWalletCard } from '@/components/CurrencyWalletCard';
import { HistoricTransaction, TransactionExtended } from '@/components/HistoricTransaction';
import { ThemedText } from '@/components/themed-text';
import { AuthContext } from '@/contexts/authContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import currenciesJson from '../../backend/currencies.json';
import { LanguageContext } from '../../contexts/languageContext';
import { ThemeContext } from '../../contexts/themeContext';
import { Fonts } from '../_layout';
import { useWindowDimensions } from 'react-native';

import { AVATAR_KEY, BASE_API_URL } from '@/config';
import { useNetInfo } from '@react-native-community/netinfo';


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
  const { token } = useContext(AuthContext);
  const { loggedin } = useLocalSearchParams<{ loggedin: string }>();  
  const { width } = useWindowDimensions();
  
  const isLargeScreen = width > 480;
  const dynamicGap = isLargeScreen ? 40 : 4;
  
  const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' | null}>({ text: '', type: null});
  const [ avatar, setAvatar ] = useState('');
  const [ loading, setLoading ] = useState(false);
  const [ wallets, setWallets ] = useState<CurrencyWalletCardProps[]>([]);
  const [ history, setHistory ] = useState<TransactionExtended[]>([]);
  const [ totalBalance, setTotalBalance ] = useState(0);
  const netInfo = useNetInfo();
  const isOffline = netInfo.isConnected === false;
  const WALLETS_CACHE_KEY = 'CACHED_WALLETS';
  const HISTORY_CACHE_KEY = 'CACHED_HISTORY';
  const TOTAL_BALANCE_CACHE_KEY = 'CACHED_TOTAL_BALANCE';
  
  useEffect(() => {
    if (loggedin === 'true') {
      setMessage({ text: strings.login_success_message, type: 'success' });
      router.setParams({ loggedin: '' });
      
      const timer = setTimeout(() => {
        setMessage({ text: '', type: null });
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [loggedin, strings.login_success_message]);



  const loadAvatar = useCallback(async () => {
    try {
      const userEmail = await AsyncStorage.getItem('USER_EMAIL'); 
      
      if (userEmail) {
        const storedAvatar = await AsyncStorage.getItem(`avatar_${userEmail}`);
        setAvatar(storedAvatar || '');
      } else {
        setAvatar('');
      }
    } catch (e) {
      //console.error('Błąd ładowania avatara:', e);
      console.log('Błąd ładowania avatara:', e);
    }
  }, []);

  const fetchRate = useCallback(async (currencyCode: string) => {
    if (currencyCode === 'PLN') return 1; 
    try {
      const response = await fetch(`${BASE_API_URL}/nbp/rate/A/${currencyCode}`);
      if (!response.ok) return 0;
      const result = await response.json();
      return result.success ? result.data[result.data.length - 1].rate : 0;
    } catch (e) { return 0; }
  }, []);

  const fetchWallets = useCallback(async () => {
    if (isOffline) {
      const cachedWallets = await AsyncStorage.getItem(WALLETS_CACHE_KEY);
      const cachedTotal = await AsyncStorage.getItem(TOTAL_BALANCE_CACHE_KEY);

      if(cachedWallets) setWallets(JSON.parse(cachedWallets));
      if(cachedTotal) setTotalBalance(parseFloat(cachedTotal));

      console.log("fetchWallets: Skip (offline)");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${BASE_API_URL}/wallet`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      const walletsData = await response.json();
      const safeWalletsData = Array.isArray(walletsData) ? walletsData : [];

      const uniqueCurrencies = [...new Set(safeWalletsData.map((w: any) => w.currency as string))]
        .filter(curr => curr !== 'PLN');
      

      const ratesArray = await Promise.all(
        uniqueCurrencies.map(async (currCode) => {
          const rate = await fetchRate(String(currCode));
          return { 
            code: currCode, 
            mid: rate || 0 
          };
        })
      );

      const total = calculateTotal(safeWalletsData, ratesArray);
      
      setWallets(walletsData);
      setTotalBalance(total);

      await AsyncStorage.setItem(WALLETS_CACHE_KEY, JSON.stringify(walletsData));
      await AsyncStorage.setItem(TOTAL_BALANCE_CACHE_KEY, total.toString());

    } finally {
      setLoading(false);
    }
  }, [isOffline, token, fetchRate]);

  const calculateTotal = (wallets: any[], rates: any[]) => {
    return wallets.reduce((sum: number, wallet: { currency: string; amount: number; }) => {
      if (wallet.currency === 'PLN') {
        return sum + wallet.amount;
      }

      const rateObj = rates.find((r: { code: any; }) => r.code === wallet.currency);
      const rate = rateObj ? rateObj.mid : 0;
      
      return sum + (wallet.amount * rate);
    }, 0);
  };

  const ensureWallet = async () => {
    if (isOffline) {
      console.log("ensureWallet: Skip (offline mode)");
      return;
    }

    try {
      const response = await fetch(`${BASE_API_URL}/wallet/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 201) {
        console.log("Wallet created");
      } else if (response.status === 400) {
        console.log("Wallet already exists");
      }
    } catch (error) {
      console.log("ensureWallet: Network error (silent catch)");
    }
  };

  const loadHistory = useCallback(async () => {
    if (isOffline) {
      const cachedHistory = await AsyncStorage.getItem(HISTORY_CACHE_KEY);
      if (cachedHistory) {
        setHistory(JSON.parse(cachedHistory));
        console.log("loadHistory: Załadowano historię z cache (offline)");
      }
      return;
    }
    
    try {
      await ensureWallet();

      const response = await fetch(`${BASE_API_URL}/wallet/history`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const rawTransactions = await response.json();
        console.log("1. RAW DATA Z SERWERA:", rawTransactions.length, "sztuk");
        
        const enhanced = rawTransactions
          .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 1)
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

        await AsyncStorage.setItem(HISTORY_CACHE_KEY, JSON.stringify(enhanced));
      }
    } catch (error) {
      //console.error("Błąd ładowania historii:", error);
      console.log("Błąd ładowania historii:", error);
    }
  }, [isOffline, token]);
  
  useFocusEffect(
    useCallback(() => {
      loadAvatar();
      fetchWallets();
      loadHistory();
    }, [loadAvatar, fetchWallets, loadHistory])
  );

  useEffect(() => {
    if (netInfo.isConnected === true) {
      console.log("Internet wrócił! Odświeżam historię...");
      loadHistory();
      fetchWallets();
    }
  }, [netInfo.isConnected]);

  useEffect(() => {
  if (netInfo.isConnected === false) {
    setMessage({ 
      text: strings.wallet_offline_error,
      type: 'error' 
    });
  } else if (netInfo.isConnected === true) {
    setMessage({ text: strings.wallet_back_online, type: 'success' });
    setTimeout(() => setMessage({ text: '', type: null }), 3000);
  }
}, [netInfo.isConnected, strings.no_internet_connection]);

  return (
    <View style={[
          styles.container,
          { backgroundColor: theme.background }
        ]}>
      <TouchableOpacity style={[styles.profileLink, { backgroundColor: theme.veryLowContrast }]} onPress={() => router.push('../profile')}>
        {avatar === '' ? (
            <ThemedText type="titleSmall">👤</ThemedText>
        ) : (
            <ThemedText type="titleSmall">{avatar}</ThemedText>
        )}
      </TouchableOpacity>

    {isOffline && (
      <View style={styles.offlineWrapper}>
        <ThemedText style={[styles.offlineText, { color: theme.lowContrast }]}>
            {strings.no_internet_connection}
        </ThemedText>
        <ThemedText style={[styles.offlineText, { color: theme.lowContrast }]}>
            {strings.no_internet_connection_disclaimer}
        </ThemedText>
      </View>
    )}

      <View style={styles.titleWrapper}>  
        <ThemedText
          type="titleMid"
          style={[{fontFamily: Fonts.bold, color: theme.highContrast}, styles.title]}
        >
          {strings.wallet_title}
        </ThemedText>
      </View>
      <View style={styles.walletWrapper}>
        <Image source={require('@/assets/images/Wallet.png')} 
          style={styles.walletImg} 
        />

        <ThemedText
          type="titleSmall"
          style={[{ color: '#EBECEC'}, styles.totalWealth]}
        >
          {strings.wallet_total_wealth}{':'+'\n'+totalBalance.toFixed(2)+'zł'} {}
        </ThemedText>
        <TouchableOpacity onPress={() => router.push('./topup')} style={styles.topUpLink}>
          <ThemedText
            type="textSmall"
            style={{ color: '#5D5D61', textDecorationLine: 'underline' }}>
            {strings.wallet_top_up_link}
          </ThemedText>
        </TouchableOpacity>
      </View>

      <View style={{maxHeight: 120}}>  
        <ScrollView
          horizontal 
          style={{ marginTop: 8, width: 320, alignSelf: 'flex-start', //backgroundColor: 'blue'
          }}
          showsHorizontalScrollIndicator={true}
          contentContainerStyle={{ 
            paddingHorizontal: 20, //'4%'
            paddingVertical: 8,
            columnGap: dynamicGap,
          }}
        >
          {loading ? (
            <ActivityIndicator color={theme.highContrast} />
          ) : (wallets && Array.isArray(wallets) && wallets.filter(w => (w.amount ?? 0) > 0).length > 0) ? ( 
            wallets
              .filter(wallet => (wallet.amount ?? 0) > 0) 
              .map((wallet, index, array) => (
                <React.Fragment key={wallet.id || index}>
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
                        marginTop: 32, //'5%'
                        marginHorizontal: 10 
                      }} 
                    />
                  )}
                </React.Fragment>
              ))
          ) : (
            <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center', paddingBottom: 12 }}>
              <ThemedText style={{ color: theme.lowContrast, textAlign: 'center' }}>
                {strings.wallet_no_funds}
              </ThemedText>
            </View>
          )}
        </ScrollView>
      </View>

      <View 
        style={[
          styles.messageContainer, 
          { 
            opacity: (message.type && message.text) ? 1 : 0 
          }
        ]}
      >
        <ThemedText 
          type="default"
          style={[
            styles.message, 
            { 
              color: message.type === 'error' ? theme.failure : theme.success 
            }
          ]} 
        >
          {/* if no text space is being displayed, to maintain proper height */}
          {message.text || " "}  
        </ThemedText>  
      </View>

      <View style={styles.titleWrapper}>  
        <ThemedText
          type="titleSmall"
          style={[{fontFamily: Fonts.bold, color: theme.highContrast}, styles.titleSmall]}>
          {strings.wallet_history}
        </ThemedText>
      </View>

      <View style={{ width: '100%', height: 136 }}>
        
        <FlatList
          data={history}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false} 
          renderItem={({ item }) => (
            <View style={{ alignSelf: 'stretch', width: '100%' }}>
              <HistoricTransaction transaction={item} />
            </View>
          )}
          ListEmptyComponent={() => (
            <ThemedText style={{ textAlign: 'center', marginTop: 40, color: theme.lowContrast }}>
              {strings.wallet_no_transactions}
            </ThemedText>
          )}
        />
        
        {/*
          {history.length > 0 ? (
            <View style={{ width: '100%' }}>
              <HistoricTransaction 
                transaction={{
                  ...history[0],
                  fromFlag: history[0].fromFlag || '🏳️',
                  toFlag: history[0].toFlag || '🏳️'
                }} 
              />
            </View>
          ) : (
              <ThemedText style={{ textAlign: 'center', marginTop: 40, color: theme.lowContrast }}>
              {strings.wallet_no_transactions}
            </ThemedText>
          )}
        */}
      </View>
      {history && history.length > 0 && (
        <TouchableOpacity onPress={() => router.push('./history')}>
          <ThemedText type='textSmall' style={[ styles.historyLink, { color: theme.lowContrast }]}>
            {strings.wallet_history_link}
          </ThemedText>
        </TouchableOpacity>
      )}
    </View>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: '4%',
    paddingTop: 120, // '32%'
  },
  profileLink: {
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 50,
    position: 'absolute', 
    top: 70, // '11%'
    right: 40, // '10.5%'
  },
  offlineWrapper: {
    position: 'absolute',
    top: 70,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
    maxWidth: 220,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  offlineText: {
    fontSize: 10,
    fontFamily: Fonts.bold,
    textAlign: 'center',
    lineHeight: 16,
  },
  titleWrapper: {
    width: '100%',
    maxWidth: 480,
  },
  title: {
    alignSelf: 'flex-start', 
    paddingLeft: '6%', 
    marginBottom: 16, //'4%'
    marginTop: '2%',
  },
  walletWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    width: 288, //264
    height: 184.42, //169
  },
  walletImg: { 
    width: 288, 
    height: 184.42, 
    position: 'absolute'
  },
  totalWealth: {
    textAlign: 'center',
    marginTop: 64,
  },
  topUpLink: {
    textAlign: 'center',
    marginTop: 12,
  },
  messageContainer: {
    marginTop: '1.5%', //iOS 3%, Android ?, Web ?
    marginBottom: '2.5%',
    paddingHorizontal: 20,
    //height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    //backgroundColor: 'blue',
  },
  message: {
    textAlign: 'center',
  },
  titleSmall: {
    alignSelf: 'flex-start', 
    paddingLeft: '6%', 
    marginVertical: '2%',
  },
  historyLink: {
    textDecorationLine: 'underline',
    marginBottom: 32, //
    alignSelf: 'center'
  },
});
