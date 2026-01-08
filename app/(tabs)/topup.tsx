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
import { ChevronDownIcon, ChevronUpIcon } from '@/components/Icons';
import { AuthContext } from '@/contexts/authContext';

import { BASE_API_URL, AVATAR_KEY } from '@/config';


export default function TopUpScreen() {
    const router = useRouter();
    const { strings } = useContext(LanguageContext);
    const { theme } = useContext(ThemeContext);
    const { token } = useContext(AuthContext);

    const [avatar, setAvatar] = useState('');
    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState('PLN');
    const [loading, setLoading] = useState(false);
    const [pickerVisibility, setPickerVisibility] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' | null}>({ text: '', type: null});

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



    const handleDeposit = async () => {
        setMessage({ text: '', type: null });    
        
        const cleanAmount = amount.replace(',', '.');
        if (!cleanAmount || parseFloat(cleanAmount) <= 0 || isNaN(parseFloat(cleanAmount))) {
            setMessage({ text: strings.topup_correct_data_required, type: 'error' });
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${BASE_API_URL}/transaction/deposit`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
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
                setMessage({ text: strings.topup_success, type: 'success' });
                setAmount(''); 
                setTimeout(() => clearMessage(), 5000);
                setPickerVisibility(false);                
            } else {
                const errorData = JSON.parse(responseText);
                setMessage({ text: strings.topup_error, type: 'error' });
            }
        } catch (error) {
            setMessage({ text: strings.topup_network_error, type: 'error' });
        } finally {
            setLoading(false);
        }
    };


    const clearMessage = () => {
        setMessage({ text: '', type: null });
    };

    const handleSetAmount = (text: string) => {
        setPickerVisibility(false);
        clearMessage();
        setAmount(text);
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
                        placeholderTextColor={theme.highContrast}
                        keyboardType="decimal-pad"
                        value={amount}
                        onChangeText={handleSetAmount}
                    />
                    <TouchableOpacity onPress={() => setPickerVisibility(!pickerVisibility)} style={{flexDirection: 'row', alignItems: "center"}}>
                        <ThemedText
                            type="titleSmall"
                            style={[{fontFamily: Fonts.medium, color: theme.lowContrast}, styles.title]}>
                            {currency}
                        </ThemedText>
                        {pickerVisibility ? (
                        <ChevronUpIcon color={theme.lowContrast} size={24} />
                        ) : (
                        <ChevronDownIcon color={theme.lowContrast} size={24} />
                        )}                          
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
                        <Picker.Item label={strings.topup_PLN} value="PLN" color={theme.highContrast}/>
                        <Picker.Item label={strings.topup_EUR} value="EUR" color={theme.highContrast}/>
                        <Picker.Item label={strings.topup_USD} value="USD" color={theme.highContrast}/>
                        <Picker.Item label={strings.topup_GBP} value="GBP" color={theme.highContrast}/>
                        <Picker.Item label={strings.topup_CHF} value="CHF" color={theme.highContrast}/>
                        <Picker.Item label={strings.topup_CZK} value="CZK" color={theme.highContrast}/>
                    </Picker>
                </View>
                )}

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
        fontFamily: Fonts.bold, 
        fontSize: 28, 
        lineHeight: 34,
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    pickerContainer: {
        width: '80%',
        height: 160,
        borderWidth: 2,
        borderRadius: 24,
        overflow: 'hidden',
        justifyContent: 'center', 
        alignSelf: 'center',
        marginBottom: 4,
    },
      messageContainer: {
        marginVertical: 10, 
        paddingHorizontal: 20
    },
    message: {
        textAlign: 'center',
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
