import React, { useCallback, useContext, useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { ThemedText } from './themed-text'; 
import { ThemeContext } from '../contexts/themeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';

const BASE_URL = 'http://192.168.18.9:4000/api/';

interface CurrencyWalletCardProps {
  id: number;
  wallet_id: number;
  currency_code: string; 
  balance: number;      
}

export function CurrencyRateCard({ id, wallet_id, currency_code, balance }: CurrencyWalletCardProps) {
    const { theme } = useContext(ThemeContext);

    
    const [userWallets, setUserWallets] = useState([]);
    const [isFetching, setIsFetching] = useState(false);

    const fetchBalances = async () => {
        setIsFetching(true);
        try {
            const userToken = await AsyncStorage.getItem('userToken');
            //  adres: /api/wallet (zgodnie z app.use w Twoim app.js)
            const response = await fetch(`${BASE_URL}wallet`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setUserWallets(data); 
            } else {
                console.error("Błąd pobierania salda");
            }
        } catch (error) {
            console.error("Błąd sieci:", error);
        } finally {
            setIsFetching(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchBalances();
        }, [])
    );
    
    return(<View style={styles.balancesContainer}>
        <ThemedText type="titleSmall" style={{ marginBottom: 15 }}>Twoje środki:</ThemedText>
        
        {userWallets.length === 0 && !isFetching && (
            <ThemedText>Brak aktywnych walut</ThemedText>
        )}

        {userWallets.map((item) => (
            <View key={item.id} style={[styles.balanceCard, { backgroundColor: theme.veryLowContrast }]}>
                <ThemedText style={{ fontFamily: Fonts.bold }}>{item.currency_code}</ThemedText>
                <ThemedText style={{ fontSize: 18 }}>
                    {item.balance.toFixed(2)} {item.currency_code}
                </ThemedText>
            </View>
        ))}
    </View>
)}

const styles = StyleSheet.create({
  balancesContainer: {
    width: '100%',
    paddingVertical: 20,
  },
  balanceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)', // Delikatna ramka
  },
});