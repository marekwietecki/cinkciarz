import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemeContext } from '../../contexts/themeContext';
import { LanguageContext } from '../../contexts/languageContext';
import { Fonts } from '../_layout';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import currenciesJson from "../../backend/currencies.json"; 
import { HistoricTransaction, TransactionExtended } from '../../components/HistoricTransaction';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const AVATAR_KEY = 'userAvatar';
const BASE_URL = 'http://192.168.18.9:4000/api';
const AUTH_TOKEN_KEY = 'userToken';


export default function HistoryScreen() {
  const router = useRouter();
    const { strings } = useContext(LanguageContext);
    const { theme } = useContext(ThemeContext);
    
    const [ avatar, setAvatar ] = useState('');
    const [ history, setHistory ] = useState<TransactionExtended[]>([]);

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

  const loadAvatar = useCallback(async () => {
    try {
      const storedAvatar = await AsyncStorage.getItem(AVATAR_KEY);
      setAvatar(storedAvatar || '');
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
      } catch (e) {
        console.error("Błąd historii:", e);
      }
  }, []);
  

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);
  
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
        {strings.history_title}
      </ThemedText>
      {history.length === 0 ? (
        <ThemedText style={{ textAlign: 'center', marginTop: 20 }}>
          Brak historii transakcji
        </ThemedText>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <HistoricTransaction transaction={item}/>}
          contentContainerStyle={{ paddingVertical: 12 }}
          ItemSeparatorComponent={() => (
            <View 
              style={{
                height: 1,
                width: '64%',         
                backgroundColor: theme.lowContrast,
                opacity: 0.15,
                alignSelf: 'center',    
                marginVertical: 4      
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
    marginBottom: '4%',
    marginTop: '2%',
  },
});
