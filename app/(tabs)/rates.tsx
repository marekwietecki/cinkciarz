import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import React, { useCallback, useContext, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { LanguageContext } from '../../contexts/languageContext';
import { ThemeContext } from '../../contexts/themeContext';
import { Fonts } from '../_layout';
import AsyncStorage from '@react-native-async-storage/async-storage';
import currenciesData from '../../backend/currencies.json';
import { CurrencyRateCard } from '@/components/CurrencyRateCard';
import { RefreshIcon } from '@/components/Icons';

import { BASE_API_URL, AVATAR_KEY } from '@/config';

interface CurrencyItem {
  name: string;
  code: string;
  symbol: string;
  flag: string;
  currentRate: string;
  trend: number;
}

const getPastDateRange = () => {
  const end = new Date();
  end.setMonth(end.getMonth() - 3);
  const start = new Date(end);
  start.setDate(start.getDate() - 7); 
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0]
  };
};

export default function RatesScreen() {
  const router = useRouter();
  const { strings } = useContext(LanguageContext);
  const { theme } = useContext(ThemeContext);
  const [effectiveDate, setEffectiveDate] = useState<string>('');
  
  const [ avatar, setAvatar ] = useState('');
  const [currencies, setCurrencies] = useState<CurrencyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const RATES_CACHE_KEY = '@rates_cache';


  const fetchExchangeData = async () => {
      try {
          const currentRes = await fetch(`${BASE_API_URL}/nbp/table/A`);
          const currentData = await currentRes.json();

          const range = getPastDateRange();
          const pastRes = await fetch(`${BASE_API_URL}/nbp/table/A?startDate=${range.start}&endDate=${range.end}`);
          const pastData = await pastRes.json();


          if (currentData.success) {
              const dateFromApi = currentData.data && currentData.data[0] ? currentData.effectiveDate : (currentData[0]?.effectiveDate || '');            
              console.log(dateFromApi);

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
                  'CZK': 5,
                  'CAD': 6 
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

              return {
                rates: finalData,  
                date: dateFromApi
              };
          }
      } catch (error) {
          console.error("Błąd przy pobieraniu kursów:", error);
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


  const loadData = useCallback(async () => {
    setLoading(true);
    try {
        const result = await fetchExchangeData();
        await loadAvatar();

        if (result) {
          setCurrencies(result.rates); 
          setEffectiveDate(result.date); 
          await AsyncStorage.setItem(RATES_CACHE_KEY, JSON.stringify(result));
        } else {
          const cached = await AsyncStorage.getItem(RATES_CACHE_KEY);
          if (cached) {
            const parsed = JSON.parse(cached);
            setCurrencies(parsed.rates);
            setEffectiveDate(parsed.date + " (offline)");
          }
        }
    } catch (error) {
        console.error("Błąd ładowania danych:", error);
    } finally {
        setLoading(false);
    }
}, [loadAvatar]);

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
        {avatar === '' ? (
            <ThemedText type="titleSmall">👤</ThemedText>
        ) : (
            <ThemedText type="titleSmall">{avatar}</ThemedText>
        )}
      </TouchableOpacity>
      
      <View style={styles.titleIconWrapper}>
        <ThemedText
          type="titleMid"
          style={[{fontFamily: Fonts.bold, color: theme.highContrast}, styles.title]}>
          {strings.rates_title}
        </ThemedText>
        <TouchableOpacity onPress={loadData} disabled={loading} style={{ paddingRight: 38 }}>
          {loading ? (
            <ActivityIndicator size="small" color={theme.midContrast} />
          ) : (
            <RefreshIcon color={theme.midContrast} size={24} />
          )}
        </TouchableOpacity>
      </View>
      <ThemedText
        type="textSmall"
        style={[{fontFamily: Fonts.regular, color: theme.lowContrast}, styles.disclaimer]}>
        {strings.rates_disclaimer}
      </ThemedText>  

      <ThemedText
        type="textSmall"
        style={[{fontFamily: Fonts.regular, color: theme.lowContrast}, styles.disclaimer]}
      >
        {strings.rates_date_info} {effectiveDate}
      </ThemedText>
      {/* 
      <TouchableOpacity onPress={() => router.push({
              pathname: '../historicRates',
              params: { currencyCode: 'GBP' } 
            })}>
        <ThemedText type='textSmall' style={[ styles.historyLink, { color: theme.lowContrast }]}>
          Historyyczne Kursy
        </ThemedText>
      </TouchableOpacity>
      */}
      <FlatList
        data={currencies}
        alwaysBounceHorizontal={false} // Blokuje odbijanie w poziomie
        showsHorizontalScrollIndicator={false}
        persistentScrollbar={true} 
        showsVerticalScrollIndicator={true}
        contentContainerStyle={{ paddingVertical: 12 }}
        keyExtractor={(item) => item.code}
        renderItem={({ item }) => (
          <TouchableOpacity 
            onPress={() => router.push({
              pathname: '../historicRates',
              params: { 
                currencyCode: item.code,
                currencyName: item.name, 
                currencyFlag: item.flag, 
                currencySymbol: item.symbol
               } 
            })}
          >
            <CurrencyRateCard 
              name={item.name}    
              code={item.code}
              symbol={item.symbol}
              flag={item.flag}
              currentRate={item.currentRate}
              trend={item.trend}
            />
          </TouchableOpacity>
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
  historyLink: {
    textDecorationLine: 'underline',
    marginBottom: 32, //
    alignSelf: 'center'
  },
});
