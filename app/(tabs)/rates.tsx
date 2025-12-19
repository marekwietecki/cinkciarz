import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import React, { useCallback, useContext, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { LanguageContext } from '../../contexts/languageContext';
import { ThemeContext } from '../../contexts/themeContext';
import { Fonts } from '../_layout';
import AsyncStorage from '@react-native-async-storage/async-storage';
import currenciesData from '../../backend/currencies.json';
import { CurrencyCard } from '@/components/CurrencyCard';

const AVATAR_KEY = 'userAvatar';
const BASE_URL = 'http://192.168.18.9:19000';

const getPastDate = () => {
    const d = new Date();
    d.setMonth(d.getMonth() - 3);
    return d.toISOString().split('T')[0];
};

const fetchExchangeData = async () => {
    try {
        const currentRes = await fetch(`${BASE_URL}/api/nbp/table/A`);
        const currentData = await currentRes.json();

        const pastDate = getPastDate();
        const pastRes = await fetch(`${BASE_URL}/api/nbp/table/A?startDate=${pastDate}&endDate=${pastDate}`);
        const pastData = await pastRes.json();

        if (currentData.success) {
            const joinedData = currentData.data.map((curr: any) => {
                const extraInfo = currenciesData.find(c => c.code === curr.code);
                
                const historyCurr = pastData.success 
                    ? pastData.data.find((h: any) => h.code === curr.code) 
                    : null;

                const currentRate = Math.round(curr.mid * 100) / 100;                
                const pastRate = historyCurr ? historyCurr.mid : currentRate;
                
                const trend = Math.round(((currentRate - pastRate) / pastRate) * 100 * 10) / 10;
                
                return {
                    name: extraInfo?.name || '',
                    code: curr.code,
                    symbol: extraInfo?.symbol || '',
                    flag: extraInfo?.flag || '🏳️',
                    currentRate: currentRate.toFixed(2),
                    trend: trend
                };
            });

            const priority: Record<string, number> = { 
                'EUR': 1, 
                'USD': 2, 
                'GBP': 3, 
                'CHF': 4,
                'CAD': 5,
                'CZK': 6 
            };

            const finalData = joinedData
                .filter((item: CurrencyItem) => parseFloat(item.currentRate) > 0) 
                .sort((a: CurrencyItem, b: CurrencyItem) => {
                    const valA = priority[a.code] || 999;
                    const valB = priority[b.code] || 999;

                    if (valA !== valB) {
                        return valA - valB;
                    }
                    return a.code.localeCompare(b.code);
                });

            return finalData;
        }
    } catch (error) {
        console.error("Błąd przy pobieraniu kursów:", error);
    }
};

interface CurrencyItem {
  name: string;
  code: string;
  symbol: string;
  flag: string;
  currentRate: string;
  trend: number;
}

export default function RatesScreen() {
  const router = useRouter();
  const { strings } = useContext(LanguageContext);
  const { theme } = useContext(ThemeContext);
  
  const [ avatar, setAvatar ] = useState('');
  const [currencies, setCurrencies] = useState<CurrencyItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const loadAvatar = async () => {
    try {
      const storedAvatar = await AsyncStorage.getItem(AVATAR_KEY);
      if (storedAvatar) {
        setAvatar(storedAvatar);
      } else {
        setAvatar('');
      }
    } catch (e) {
      console.error('Błąd ładowania avatara:', e);
    }
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    
    try {
      const [data] = await Promise.all([
        fetchExchangeData(),
        loadAvatar()
      ]);

      if (data) {
        setCurrencies(data);
      }
    } catch (error) {
      console.error("Błąd ładowania danych:", error);
    } finally {
      setLoading(false);
    }
  }, []); 

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]) 
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
        {strings.rates_title}
      </ThemedText>

      <FlatList
        data={currencies}
        alwaysBounceHorizontal={false} // Blokuje odbijanie w poziomie
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 12 }}
        keyExtractor={(item) => item.code}
        renderItem={({ item }) => (
          <CurrencyCard 
              name={item.name}    
              code={item.code}
              symbol={item.symbol}
              flag={item.flag}
              currentRate={item.currentRate}
              trend={item.trend}
          />
        )}
        refreshing={loading}
        onRefresh={loadData}
      />  
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: '4%',
    paddingTop: '32%',
  },
  profileLink: {
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 50,
    position: 'absolute', 
    top: '11%', 
    left: '8%',
  },
  title: {
    alignSelf: 'flex-start', 
    paddingLeft: '6%', 
    marginBottom: '4%',
    marginTop: '2%',
  },
});
