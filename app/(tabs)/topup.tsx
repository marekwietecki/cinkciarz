import { ActivityIndicator, Alert, StyleSheet, TextInput, TouchableOpacity, View, Keyboard, 
  TouchableWithoutFeedback } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import React, { useCallback, useContext, useState } from 'react';
import { ThemeContext } from '../../contexts/themeContext';
import { LanguageContext } from '../../contexts/languageContext';
import { useFocusEffect, useRouter } from 'expo-router';
import { Fonts } from '../_layout';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { ChevronDownIcon } from 'lucide-react-native';

const AVATAR_KEY = 'userAvatar';
const BASE_URL = 'http://192.168.18.9:4000/api/transaction';


    export default function WalletScreen() {
        const router = useRouter();
        const { strings } = useContext(LanguageContext);
        const { theme } = useContext(ThemeContext);

        const [ avatar, setAvatar ] = useState('');
        const [amount, setAmount] = useState('');
        const [currency, setCurrency] = useState('PLN');
        const [loading, setLoading] = useState(false);
        const [pickerVisibility, setPickerVisibility] = useState(false);

        const loadAvatar = useCallback(async () => {
            try {
            const storedAvatar = await AsyncStorage.getItem(AVATAR_KEY);
            setAvatar(storedAvatar || '');
            } catch (e) {
            console.error('Błąd ładowania avatara:', e);
            }
        }, []);

        const handleDeposit = async () => {
        // 1. Walidacja lokalna
        const cleanAmount = amount.replace(',', '.');
        if (!cleanAmount || parseFloat(cleanAmount) <= 0 || isNaN(parseFloat(cleanAmount))) {
            Alert.alert("Błąd", "Wpisz poprawną kwotę (np. 10.50)");
            return;
        }

        setLoading(true);
        try {
            const userToken = await AsyncStorage.getItem('userToken');
            
            // PAMIĘTAJ: Sprawdź w index.js czy to na pewno /api/wallet czy /api/transactions
            const response = await fetch(`${BASE_URL}/deposit`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: parseFloat(cleanAmount),
                    currency: currency,
                }),
            });

            const responseText = await response.text();
            console.log("Odpowiedź serwera:", responseText);

            if (response.ok) {
                Alert.alert("Sukces", "Kasa doładowana!");
                setAmount(''); 
            } else {
                const errorData = JSON.parse(responseText);
                Alert.alert("Błąd", errorData.message || "Coś nie pykło");
            }
        } catch (error) {
            Alert.alert("Błąd sieci", "Serwer nie odpowiada");
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
        loadAvatar();
        }, [loadAvatar])
    );

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
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
                    {strings.topup_title}
                </ThemedText>
                    <View style={styles.topUpWrapper}>
                        <TextInput
                            style={[styles.textInput, { color: theme.highContrast, borderColor: theme.lowContrast }]}
                            placeholder="0.00"
                            placeholderTextColor={theme.lowContrast}
                            keyboardType="decimal-pad"
                            value={amount}
                            onChangeText={setAmount}
                        />
                        <TouchableOpacity onPress={() => setPickerVisibility(!pickerVisibility)} style={{flexDirection: 'row', alignItems: "center"}}>
                            <ThemedText
                                type="titleSmall"
                                style={[{fontFamily: Fonts.medium, color: theme.lowContrast}, styles.title]}>
                                {currency}
                            </ThemedText>
                            <ChevronDownIcon color={theme.lowContrast} size={24}></ChevronDownIcon>
                        </TouchableOpacity>
                    </View>

                    {pickerVisibility && (
                    <View style={[styles.pickerContainer, { borderColor: theme.lowContrast }]}>
                        <Picker
                            selectedValue={currency}
                            onValueChange={(itemValue) => setCurrency(itemValue)}
                            style={{ color: theme.highContrast }}
                            dropdownIconColor={theme.highContrast}
                        >
                            <Picker.Item label="Polski Złoty (PLN)" value="PLN" color={theme.highContrast}/>
                            <Picker.Item label="Euro (EUR)" value="EUR" color={theme.highContrast}/>
                            <Picker.Item label="Dolar Amerykański (USD)" value="USD" color={theme.highContrast}/>
                            <Picker.Item label="Funt Brytyjski (GBP)" value="GBP" color={theme.highContrast}/>
                            <Picker.Item label="Frank Szwajcarski (CHF)" value="CHF" color={theme.highContrast}/>
                        </Picker>
                    </View>
                    )}
                

                <TouchableOpacity 
                    style={[styles.button, { backgroundColor: theme.highContrast }]} 
                    onPress={handleDeposit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={theme.background} />
                    ) : (
                        <ThemedText type='default' style={{ color: theme.accentDark}}>
                            {loading ? strings.topup_loading : strings.topup_button}
                        </ThemedText>                
                    )}
                </TouchableOpacity>
            </View>
        </TouchableWithoutFeedback>
    )};

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
  topUpWrapper: {
    flexDirection: 'row', 
    alignItems: "center", 
    marginTop: '58%', 
    marginBottom: '2%', 
    marginLeft: '25%', 
    gap: 16
  },
  textInput: {
    fontFamily: Fonts.regular, 
    fontSize: 20, 
    lineHeight: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderRadius: 32,
  },
  pickerContainer: {
    width: '88%',
    borderWidth: 2,
    borderRadius: 24,
    marginBottom: 30,
    overflow: 'hidden',
    justifyContent: 'center', 
},
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 24
  },
  buttonText: {

  }
});
