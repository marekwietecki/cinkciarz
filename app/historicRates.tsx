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


export default function TransactionChart({  }) {
  const router = useRouter();
  const { strings } = useContext(LanguageContext);
  const { theme } = useContext(ThemeContext);
  const { currencyCode, currencyName, currencyFlag, currencySymbol } = useLocalSearchParams();  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchHistoryData = async (code: string) => {
    try {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 30); // Tutaj możesz dać np. 90 dni, jeśli chcesz więcej danych

        const startDate = start.toISOString().split('T')[0];
        const endDate = end.toISOString().split('T')[0];

        const response = await fetch(
            `${BASE_API_URL}/nbp/rate/A/${code}?startDate=${startDate}&endDate=${endDate}`
        );
        const result = await response.json();

        if (result.success && result.data) {
            const points = result.data.map((item: any) => item.rate);

            // Mapujemy punkty na etykiety ze strings
            const labels = points.map((_: any, index: number) => { // Dodano : number
              const transLabels = strings.historicRates_chart_dates; 
              const dataLength = points.length;
              const labelsCount = transLabels.length;

              // Obliczamy krok, aby rozłożyć etykiety równomiernie
              const step = Math.floor(dataLength / (labelsCount - 1 || 1));
              
              // Sprawdzamy, czy dany punkt powinien otrzymać etykietę ze strings
              if (index % step === 0 && (index / step) < labelsCount) {
                  return transLabels[Math.floor(index / step)];
              }
              return ""; 
            });

            const finalDataObject = {
                labels: labels,
                datasets: [{ data: points }]
            };
            console.log("Dane przygotowane do wykresu:", finalDataObject);
            return finalDataObject;
        }
    } catch (error) {
        console.error("Błąd pobierania historii:", error);
        return null;
    }
}

  useEffect(() => {
    if (currencyCode) {
      const load = async () => {
          console.log("Start ładowania dla:", currencyCode); // Dodaj tego loga!
          const data = await fetchHistoryData(currencyCode as string);
          setChartData(data);
          setLoading(false);
      };
      load();
    }
  }, [currencyCode]);


  return (
    <>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
              <ChevronLeftIcon color={theme.highContrast} size={30}></ChevronLeftIcon>
          </TouchableOpacity>

      <View style={[ styles.container, { backgroundColor: theme.background }]}>
          <ThemedText
            type="titleMid"
            style={[{fontFamily: Fonts.bold, color: theme.highContrast}, styles.title]}>
            {strings.historicRates_title}
          </ThemedText> 

          <View style={styles.infoContainer}>
              <View style={styles.infoRow}>
                  <ThemedText style={styles.flag}>{currencyFlag}</ThemedText>
                  <View>
                      <ThemedText type="titleSmall" style={{ color: theme.highContrast }}>
                          {currencyName} ({currencyCode})
                      </ThemedText>
                      <ThemedText type="textSmall" style={{ color: theme.lowContrast }}>
                          {strings.historicRates_owned_amount}: TU TRZEBA POBRAĆ ILOŚĆ POSIADANĄ {currencySymbol} 
                          {/* Zakładam, że owned_amount masz w strings, a 0.00 to placeholder */}
                      </ThemedText>
                  </View>
              </View>
          </View>

          {chartData && chartData.labels && chartData.datasets ? (
          <LineChart
            data={chartData}
            width={300} 
            height={220}
            yAxisLabel="$"
            chartConfig={{
              backgroundColor: "#e26a00",
              backgroundGradientFrom: "#fb8c00",
              backgroundGradientTo: "#ffa726",
              decimalPlaces: 2, 
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16
              },
              propsForDots: {
                r: "3",
                strokeWidth: "2",
                stroke: "#ffa726"
              },
            }}
            bezier 
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
          ) : (
            <ActivityIndicator size="large" color={theme.highContrast} />
          )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
    container: { 
        padding: 20, 
        justifyContent: 'center', 
        alignItems: 'center',
        alignSelf: 'center',
        flex: 1,
        width: '100%',
        maxWidth: 480, 
    },
    title: {
      alignSelf: 'flex-start', 
      paddingLeft: '6%', 
      marginBottom: '4%',
      marginTop: '2%',
    },
    back: {
        position: 'absolute', 
        top: '8%', 
        left: '4%',
        zIndex: 10,
    },
    infoContainer: {
      width: '100%',
      paddingHorizontal: '6%',
      marginBottom: 20,
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
})