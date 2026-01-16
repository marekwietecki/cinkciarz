import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemeContext } from '../../contexts/themeContext';
import { LanguageContext } from '../../contexts/languageContext';
import { Fonts } from '../_layout';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import currenciesJson from "../../backend/currencies.json";
import { HistoricTransaction, TransactionExtended } from '../../components/HistoricTransaction';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '@/contexts/authContext';
import { SortAZIcon, SortZAIcon } from '@/components/Icons';
import { useNetInfo } from '@react-native-community/netinfo';

import { AVATAR_KEY, BASE_API_URL } from '@/config';


export default function HistoryScreen() {
  const router = useRouter();
  const { strings } = useContext(LanguageContext);
  const { theme } = useContext(ThemeContext);
  const { token } = useContext(AuthContext);
  
  const [ avatar, setAvatar ] = useState('');
  const [ history, setHistory ] = useState<TransactionExtended[]>([]);
  const [historyDirection, setHistoryDirection] = useState<'AZ' | 'ZA'>('AZ');
  const HISTORY_CACHE_KEY = '@wallet_history_cache';
  const netInfo = useNetInfo();
  const isOffline = netInfo.isConnected === false;  
  const [isDataFromCache, setIsDataFromCache] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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
      console.error('Błąd ładowania avatara:', e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAvatar();
    }, [loadAvatar])
  );

  const loadHistory = useCallback(async () => {
    try {
      ensureWallet();
      const response = await fetch(`${BASE_API_URL}/wallet/history`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.log("Status błędu:", response.status);
        throw new Error('Błąd pobierania');
      }

      const rawTransactions = await response.json();
        
        const enhancedHistory = rawTransactions.map((tx: any) => {
          const fromInfo = currenciesJson.find(c => c.code === tx.from_currency);
          const toInfo = currenciesJson.find(c => c.code === tx.to_currency);

          return {
            ...tx,
            fromFlag: fromInfo?.flag || '🏳️',
            toFlag: toInfo?.flag || '🏳️',
          };
        });
        
        setHistory(enhancedHistory);
        setIsDataFromCache(false);

        await AsyncStorage.setItem(HISTORY_CACHE_KEY, JSON.stringify(enhancedHistory));
      } catch (e) {
        //console.error("Błąd historii:", e);
        console.log("Błąd historii:", e);
        setIsDataFromCache(true);
        
        const cachedData = await AsyncStorage.getItem(HISTORY_CACHE_KEY);
        if (cachedData) {
          setHistory(JSON.parse(cachedData));
        }
      }
  }, []);
  

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const toggleSort = () => {
    setHistoryDirection(prev => prev === 'AZ' ? 'ZA' : 'AZ');
  };
  
  const sortedHistory = useMemo(() => {
    return [...history].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();

      if (historyDirection === 'AZ') {
        return dateB - dateA;
      } else {
        return dateA - dateB;
      }
    });
  }, [history, historyDirection]);

  useEffect(() => {
    if (netInfo.isConnected === true) {
      console.log("Internet wrócił! Odświeżam historię...");
      loadHistory();
    }
  }, [netInfo.isConnected, loadHistory]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

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

      <View style={styles.titleIconWrapper}>
        <ThemedText
          type="titleMid"
          style={[{fontFamily: Fonts.bold, color: theme.highContrast}, styles.title]}>
          {strings.history_title}
        </ThemedText>
        <TouchableOpacity onPress={toggleSort} style={{ paddingRight: '10%' }}>
          {historyDirection === 'AZ' ? (
            <SortZAIcon color={theme.midContrast} size={24} />
          ) : (
            <SortAZIcon color={theme.midContrast} size={24} />
          )}
        </TouchableOpacity>
      </View>

      {(isOffline || isDataFromCache) && (
        <ThemedText
          type="textSmall"
          style={[{ fontFamily: Fonts.regular, color: theme.lowContrast }, styles.disclaimer]}
        >
          {strings.history_disclaimer}
        </ThemedText>
      )}

      {history.length === 0 ? (
        <ThemedText style={{ textAlign: 'center', marginTop: 20, color: theme.highContrast }}>
          Brak historii transakcji
        </ThemedText>
      ) : (
        <FlatList
          data={sortedHistory}
          refreshing={refreshing}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <HistoricTransaction transaction={item}/>}
          contentContainerStyle={{ paddingVertical: 12 }}
          ItemSeparatorComponent={() => (
            <View 
              style={{
                height: 1,
                width: '56%',         
                backgroundColor: theme.lowContrast,
                opacity: 0.15,
                alignSelf: 'center',    
                marginVertical:  4      
              }} 
            />
          )}
        />
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
  titleIconWrapper: {
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    width: '100%',
    maxWidth: 480,
  },
  title: {
    alignSelf: 'flex-start', 
    paddingLeft: '6%', 
    marginBottom: '4%',
    marginTop: '2%',
  },
  disclaimer: {
    alignSelf: 'center',
    textAlign: 'center', 
    marginTop: 6, // '2%'
    marginBottom: 12, // '4%'
    paddingHorizontal: 48, // '10%'
    maxWidth: 480,
  },
});
