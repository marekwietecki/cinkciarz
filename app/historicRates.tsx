import { LineChart } from "react-native-chart-kit";
import { Dimensions, TouchableOpacity, View, StyleSheet, ActivityIndicator } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { ThemedText } from "@/components/themed-text";
import { LanguageContext } from '../contexts/languageContext';
import { ThemeContext } from '../contexts/themeContext';
import { Fonts } from './_layout';
import { useRouter } from "expo-router";
import { ChevronLeftIcon } from "@/components/Icons";
import { useLocalSearchParams } from 'expo-router';


import { BASE_API_URL } from '@/config';
import { AuthContext } from "@/contexts/authContext";


export default function TransactionChart({  }) {
  const router = useRouter();
  const { strings } = useContext(LanguageContext);
  const { theme } = useContext(ThemeContext);
  const { token } = useContext(AuthContext);
  const { currencyCode, currencyName, currencyFlag, currencySymbol } = useLocalSearchParams();  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(90);
  const [wallets, setWallets] = useState<any[]>([]);

  const fetchWallets = async () => {
    try {
      const response = await fetch(`${BASE_API_URL}/wallet`, {
        headers: { 'Authorization': `Bearer ${token}` }, 
      });
      
      const walletsData = await response.json();
      const safeWalletsData = Array.isArray(walletsData) ? walletsData : [];
      
      setWallets(safeWalletsData);
    } catch (error) {
      console.error("Błąd pobierania portfeli:", error);
    }
  };

  const fetchHistoryData = async (code: string, days: number) => { 
    try {
        setLoading(true);
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - days); 

        const startDate = start.toISOString().split('T')[0];
        const endDate = end.toISOString().split('T')[0];

        const response = await fetch(
            `${BASE_API_URL}/nbp/rate/A/${code}?startDate=${startDate}&endDate=${endDate}`
        );
        const result = await response.json();

        if (result.success && result.data) {
            const points = result.data.map((item: any) => item.rate);
            
            const labels = points.map((_: any, index: number) => {
                const transLabels = days === 365 
                ? strings.historicRates_chart_dates_year
                : strings.historicRates_chart_dates_three_months; 
                const dataLength = points.length;
                const labelsCount = transLabels.length;
                const step = Math.floor(dataLength / (labelsCount - 1 || 1));
                if (index % step === 0 && (index / step) < labelsCount) {
                    return transLabels[Math.floor(index / step)];
                }
                return ""; 
            });

            return { labels, datasets: [{ data: points }] };
        }
    } catch (error) {
        console.error("Błąd:", error);
        return null;
    } finally {
        setLoading(false);
    }
  };

  const currentWallet = wallets.find(w => w.currency === currencyCode);
  const amount = currentWallet ? currentWallet.amount : 0;

  useEffect(() => {
    if (currencyCode) {
      const load = async () => {
        setLoading(true); 
        try {
          const [data] = await Promise.all([
            fetchHistoryData(currencyCode as string, period),
            fetchWallets() 
          ]);
          setChartData(data);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false); 
        }
      };
      load();
    }
  }, [currencyCode, period]);


  return (
    <>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <ChevronLeftIcon color={theme.highContrast} size={30}></ChevronLeftIcon>
      </TouchableOpacity>

      <View style={[ styles.container, { backgroundColor: theme.background }]}>
          <View style={styles.titleWrapper}> 
            <ThemedText
              type="titleMid"
              style={[{fontFamily: Fonts.bold, color: theme.highContrast}, styles.title]}>
              {strings.historicRates_title}
            </ThemedText> 
          </View>
          <View style={styles.infoContainer}>
              <View style={styles.infoRow}>
                  <ThemedText style={styles.flag}>{currencyFlag}</ThemedText>
                  <View>
                      <ThemedText type="titleSmall" style={{ color: theme.highContrast }}>
                          {currencyName} ({currencyCode})
                      </ThemedText>
                      <ThemedText type="textSmall" style={{ color: theme.lowContrast }}>
                          {strings.historicRates_owned_amount}: {amount.toFixed(2)} {currencySymbol} 
                      </ThemedText>
                  </View>
              </View>
          </View>

           

          {chartData && chartData.labels && chartData.datasets ? (
          <View style={styles.chartWrapper}>
            <LineChart
              data={chartData}
              width={290} 
              height={200}
              yAxisLabel="$"
              chartConfig={{
                backgroundColor: "#B78212",
                backgroundGradientFrom: "#B78212",
                backgroundGradientTo: "#B78212",
                decimalPlaces: 2, 
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: "1",
                  strokeWidth: "1",
                  stroke: '#E5B855' //gold400
                },
                propsForLabels: {
                  fontWeight: "600",
                  fontSize: 10,
                },
                propsForBackgroundLines: {
                  strokeWidth: 0,
                },
                fillShadowGradientFromOpacity: 0.5,
                fillShadowGradientToOpacity: 0,
              }}
              bezier 
              style={{
                borderRadius: 16,
              }}
            />
          </View>
          ) : (
            <ActivityIndicator size="large" color={theme.highContrast} />
          )}

          <ThemedText
            type="textSmall"
            style={[{fontFamily: Fonts.regular, color: theme.lowContrast}, styles.disclaimer]}>
            {strings.historicRates_disclaimer}({currencyCode})
          </ThemedText>
          <ThemedText
            type="textSmall"
            style={[{fontFamily: Fonts.regular, color: theme.lowContrast}, styles.disclaimer]}>
            {strings.historicRates_period}
          </ThemedText>

          <View style={styles.selectorContainer}>
            <View style={styles.selectorButtonWrapper}>
              <TouchableOpacity 
                onPress={() => {
                  setChartData(null); 
                  setPeriod(90);
                }} 
                style={[
                  styles.selectorButton, 
                  period === 90 && { borderBottomColor: theme.highContrast, borderBottomWidth: 3 }
                ]}
              >
                <ThemedText style={[
                  styles.selectorText, 
                  { color: period === 90 ? theme.highContrast : theme.lowContrast }
                ]}>
                  {strings.historicRates_three_months}
                </ThemedText>
              </TouchableOpacity>
            </View>
            <View style={styles.selectorButtonWrapper}>
              <TouchableOpacity 
                onPress={() => {
                  setChartData(null); 
                  setPeriod(365);
                }}  
                style={[
                  styles.selectorButton, 
                  period === 365 && { borderBottomColor: theme.highContrast, borderBottomWidth: 3 }
                ]}
              >
                <ThemedText style={[
                  styles.selectorText, 
                  { color: period === 365 ? theme.highContrast : theme.lowContrast }
                ]}>
                  {strings.historicRates_year}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: '4%',
    paddingTop: 120, // '32%'
  },
  titleWrapper: {
    width: '100%',
    maxWidth: 480,
    marginBottom: 40,
  },
  title: {
    alignSelf: 'flex-start', 
    paddingLeft: '6%', 
    marginBottom: '6%',
    marginTop: '2%',
  },
  back: {
      position: 'absolute', 
      top: '8%', 
      left: '4%',
      zIndex: 10,
  },
  infoContainer: {
    width: '92%',
    paddingRight: '10%',
    paddingLeft: '6%',
    marginBottom: 20,
    justifyContent: 'flex-start',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)', 
    padding: 15,
    borderRadius: 12,
  },
  flag: {
    fontSize: 32,
    lineHeight: 40,
    marginRight: 15,
  },
  chartWrapper: {
    paddingTop: 12,
    paddingRight: 10,
    paddingBottom: 2,
    backgroundColor: '#B78212',
    borderRadius: 16,
    marginBottom: 20,
  },
  disclaimer: {
    alignSelf: 'center',
    textAlign: 'center', 
    marginTop: 6, 
    marginBottom: 12, 
    paddingHorizontal: 48, 
    maxWidth: 480,
  },
  selectorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '92%',
  },
  selectorButtonWrapper: {
    width: 120, 
  },
  selectorButton: {
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    justifyContent: 'center',
    alignSelf: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  selectorText: {
    fontFamily: Fonts.bold,
    fontSize: 14,
  },
})