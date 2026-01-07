import { ActivityIndicator, StyleSheet, TouchableOpacity, View, ScrollView, FlatList, Image } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../../contexts/themeContext';
import { LanguageContext } from '../../contexts/languageContext';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
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
  const { loggedin } = useLocalSearchParams();
  
  
  const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' | null}>({ text: '', type: null});
  const [ avatar, setAvatar ] = useState('');
  const [ loading, setLoading ] = useState(false);
  const [ wallets, setWallets ] = useState<CurrencyWalletCardProps[]>([]);
  const [ history, setHistory ] = useState<TransactionExtended[]>([]);
  const [ totalBalance, setTotalBalance ] = useState(0);
  
  useEffect(() => {
    if (loggedin === 'true') {
      setMessage({ text: strings.login_success_message, type: 'success' });
      
      const timer = setTimeout(() => {
        setMessage({ text: '', type: null });
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [loggedin, strings.login_success_message]);



  const loadAvatar = useCallback(async () => {
    try {
      const storedAvatar = await AsyncStorage.getItem(AVATAR_KEY);
      setAvatar(storedAvatar || '');
    } catch (e) {
      console.error('Błąd ładowania avatara:', e);
    }
  }, []);

const fetchRate = useCallback(async (currencyCode: string) => {
  if (currencyCode === 'PLN') return 1; 
  try {
    const response = await fetch(`${BASE_URL}/nbp/rate/A/${currencyCode}`);
    if (!response.ok) return 0;
    const result = await response.json();
    return result.success ? result.data[result.data.length - 1].rate : 0;
  } catch (e) { return 0; }
}, []);

const fetchWallets = useCallback(async () => {
  try {
    setLoading(true);
    const userToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY); 

    if (!userToken) {
      console.error("Brak tokena!");
      return; 
    }

    const response = await fetch(`${BASE_URL}/wallet`, {
      headers: { 'Authorization': `Bearer ${userToken}` },
    });
    
    const walletsData = await response.json();
    const safeWalletsData = Array.isArray(walletsData) ? walletsData : [];
    const uniqueCurrencies = [...new Set(safeWalletsData.map((w: any) => w.currency as string))]
      .filter(curr => curr !== 'PLN');

    const ratesArray = await Promise.all(
      uniqueCurrencies.map(async (currCode) => {
        
        const code = String(currCode); 
        
        const rate = await fetchRate(code);
        
        return { 
          code: code, 
          mid: rate || 0 
        };
      })
    );

    const total = calculateTotal(walletsData, ratesArray);
    
    setWallets(walletsData);
    setTotalBalance(total);
  } finally {
    setLoading(false);
  }
}, [fetchRate]);

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

      <Image source={require('@/assets/images/Wallet.png')} 
        style={{ width: 264 , height: 169 , marginTop: 16}} 
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

      <ScrollView
        horizontal 
        style={{ marginTop: '4%' }}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ 
          paddingHorizontal: '4%', 
          paddingVertical: 8 
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
                      marginTop: '5%',
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
      
      {message.type && message.text ? (
        <View style={ styles.messageContainer }>
          <ThemedText 
            type="default"
            style={[styles.message, {color: message.type === 'error' ? theme.failure : theme.success}]} 
          >
            {message.text}  
          </ThemedText>  
        </View>
      ) : null}

      <ThemedText
        type="titleSmall"
        style={[{fontFamily: Fonts.bold, color: theme.highContrast}, styles.titleSmall]}>
        {strings.wallet_history}
      </ThemedText>
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
  totalWealth: {
    position: 'absolute',
    top: '44%',
    textAlign: 'center'
  },
  topUpLink: {
    position: 'absolute',
    top: '52%',
  },
  messageContainer: {
    marginVertical: 16, 
    paddingHorizontal: 20
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
    marginBottom: '8%',
    alignSelf: 'center'
  },
});
