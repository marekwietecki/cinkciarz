import { ActivityIndicator, Platform, StyleSheet, TextInput, TouchableOpacity, View, Keyboard, 
  TouchableWithoutFeedback } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../../contexts/themeContext';
import { LanguageContext } from '../../contexts/languageContext';
import { useFocusEffect, useRouter } from 'expo-router';
import { Fonts } from '../_layout';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { ChevronDownIcon, ChevronUpIcon } from '@/components/Icons';
import { AuthContext } from '@/contexts/authContext';
import currencies from '../../backend/currencies.json';
import { useNetInfo } from '@react-native-community/netinfo';



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
    const netInfo = useNetInfo();
    const isOffline = netInfo.isConnected === false; 

    const handleDismiss = () => {
        if (Platform.OS !== 'web') {
            Keyboard.dismiss();
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

    const handleSetAmount = (val: string) => {
        setPickerVisibility(false);
        let cleanVal = val.replace(',', '.');
        const regex = /^\d*\.?\d{0,2}$/;
        if (cleanVal !== "" && !regex.test(cleanVal)) {
            return;
        }
        clearMessage();
        setAmount(cleanVal);
    };


    useFocusEffect(
        useCallback(() => {
        loadAvatar();
        }, [loadAvatar])
    );

    useEffect(() => {
        if (netInfo.isConnected === true) {
          console.log("Internet wrócił! Odświeżam historię...");
        }
    }, [netInfo.isConnected]);

    useEffect(() => {
        if (netInfo.isConnected === false) {
          setMessage({ 
            text: strings.topup_offline_error, 
            type: 'error' 
          });
        } else if (netInfo.isConnected === true) {
          console.log("Internet wrócił!");
          
          if (message.text === strings.topup_offline_error) {
            setMessage({ text: '', type: null });
          }
          
        }
    }, [netInfo.isConnected, strings.topup_offline_error]);

return (
    <TouchableWithoutFeedback onPress={handleDismiss} accessible={false}>
        <View style={[
            styles.container,
            { backgroundColor: theme.background }
            ]}>
            <TouchableOpacity style={[styles.profileLink, { backgroundColor: theme.veryLowContrast }]} onPress={() => router.push('../profile')}
            >
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

            <View style={styles.titleWrapper}>
                <ThemedText
                    type="titleMid"
                    style={[{fontFamily: Fonts.bold, color: theme.highContrast}, styles.title]}>
                    {strings.topup_title}
                </ThemedText>
            </View>
            <View style={styles.centerContainer}>
                <View style={styles.topUpWrapper}>
                    <TextInput
                        style={[styles.textInput, { color: theme.highContrast, borderColor: theme.lowContrast }]}
                        placeholder="0.00"
                        placeholderTextColor={theme.highContrast}
                        editable={!isOffline && !loading}
                        keyboardType="decimal-pad"
                        value={amount}
                        onChangeText={handleSetAmount}
                        selectTextOnFocus={true}
                    />
                    <TouchableOpacity onPress={() => setPickerVisibility(!pickerVisibility)} style={{flexDirection: 'row', alignItems: "center"}}>
                        <ThemedText
                            type="titleSmall"
                            style={[{fontFamily: Fonts.medium, color: theme.lowContrast}, styles.currency]}>
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
                        onValueChange={(itemValue) => {
                            setPickerVisibility(false);
                            setCurrency(itemValue)
                        }}
                        style={{ color: theme.highContrast }}
                        dropdownIconColor={theme.highContrast}
                    >
                        {currencies.map((curr) => (
                        <Picker.Item 
                          key={curr.code} 
                          label={`${curr.code} - ${curr.name}`} 
                          value={curr.code} 
                          color={theme.highContrast}
                        />
                      ))}
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
            </View>

            

            <TouchableOpacity 
                style={[styles.button, { backgroundColor: theme.highContrast, opacity: (loading || isOffline) ? 0.2 : 1 }]} 
                onPress={handleDeposit}
                disabled={loading || isOffline}            
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
        paddingTop: 120, // '32%'
        alignSelf: 'center',  
        width: '100%'
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
        maxWidth: 200,
    },
    offlineText: {
        fontSize: 12,
        fontFamily: Fonts.bold,
        textAlign: 'center',
    },
    titleWrapper: {
        width: '100%',
        maxWidth: 480,
    },
    title: {
        alignSelf: 'flex-start', 
        paddingLeft: '6%', 
        marginBottom: '6%',
        marginTop: '2%',
    },
    currency: {
        alignSelf: 'flex-start', 
        paddingLeft: '2%', 
    },
    centerContainer: { 
        justifyContent: 'center',  
        alignItems: 'center',     
        width: '100%',
        top: '30%'
        //marginTop: 200,      
    },
    topUpWrapper: {
        /*
        position: 'absolute',
        top: '50%',          // Przesuń górną krawędź 
        left: '50%',
        transform: [
            { translateX: -60 }, // Połowa szerokości (jeśli ustawisz width: 300)
            { translateY: -70 }   // Połowa szacowanej wysokości
        ],        
        */
        flexDirection: 'row', 
        alignItems: "center", 
        alignSelf: 'center',
        justifyContent: 'flex-end',
        //marginTop: 212, //'58%' 
        marginBottom: '2%', 
        gap: 16,
        width: 240,
        marginLeft: 32,
    },
    textInput: {
        fontFamily: Fonts.bold, 
        fontSize: 28, 
        lineHeight: 34,
        paddingVertical: 12,
        paddingHorizontal: 24,
        maxWidth: 240,
        justifyContent: 'flex-end',
        textAlign: 'right'
    },
    pickerContainer: {
        width: '80%',
        maxWidth: 300,
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
        marginTop: 'auto', 
        marginBottom: 40,
    },
});
