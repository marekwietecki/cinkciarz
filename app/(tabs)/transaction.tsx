import { ActivityIndicator, Alert, Keyboard, ScrollView, StyleSheet, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { ThemeContext } from '../../contexts/themeContext';
import { LanguageContext } from '../../contexts/languageContext';
import { useFocusEffect, useRouter } from 'expo-router';
import { Fonts } from '../_layout';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { ChevronDownIcon, ArrowDownUpIcon } from '@/components/Icons';
import currenciesJson from '../../backend/currencies.json';
import { AuthContext } from '@/contexts/authContext';

import { BASE_API_URL, AVATAR_KEY } from '@/config';

export default function WalletScreen() {
  const router = useRouter();
  const { strings } = useContext(LanguageContext);
  const { theme } = useContext(ThemeContext);
  const { token } = useContext(AuthContext);
  
  const [avatar, setAvatar] = useState('');
  const [loading, setLoading] = useState(false);
  const [pickerFirstVisibility, setPickerFirstVisibility] = useState(false);
  const [pickerSecondVisibility, setPickerSecondVisibility] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' | null}>({ text: '', type: null});

  const [fromCurrency, setFromCurrency] = useState('PLN');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [toRate, setToRate] = useState<number | null>(null);
  const [fromRate, setFromRate] = useState<number | null>(null);
  const [transactionRate, setTransactionRate] = useState<number | null>(null);
  const [amount, setAmount] = useState('');
  const [lastChanged, setLastChanged] = useState<'from' | 'to'>('from');

  const getCurrencyData = (code: string) => {
    const currency = currenciesJson.find(c => c.code === code);
    return {
      flag: currency?.flag || '🏳️',
      symbol: currency?.symbol || code,
    };
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

const fetchRate = useCallback(async (currencyCode: string) => {
  if (currencyCode === 'PLN') return 1; 
  
  try {
    setLoading(true);
    const response = await fetch(`${BASE_API_URL}/nbp/rate/A/${currencyCode}`);

    if (!response.ok) {
      console.warn(`Serwer zwrócił błąd dla ${currencyCode}: status ${response.status}`);
      return 0; 
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error("Serwer nie zwrócił JSON-a!");
      return 0;
    }

    const result = await response.json();

    if (result.success && result.data && result.data.length > 0) {
      return result.data[result.data.length - 1].rate;
    }
    return 0;
  } catch (error) {
    console.error(`Błąd sieci dla ${currencyCode}:`, error);
    return 0;
  } finally {
    setLoading(false);
  }
}, []);


  const calculateTransactionRate = useCallback(async () => {
    const fRate = await fetchRate(fromCurrency);
    const tRate = await fetchRate(toCurrency);
   
    setFromRate(fRate);
    setToRate(tRate);
    
    const finalRate = fRate / tRate * 0.995;
  
    setTransactionRate(finalRate);

  }, [fromCurrency, toCurrency, fetchRate]);

  useEffect(() => {
    calculateTransactionRate();
  }, [fromCurrency, toCurrency, calculateTransactionRate]);

  const getDisplayValues = () => {
    const numAmount = parseFloat(amount.replace(',', '.')) || 0;
    if (!transactionRate) return { from: amount, to: '' };

    if (lastChanged === 'from') {
      return {
        from: amount,
        to: numAmount === 0 ? '' : (numAmount * transactionRate).toFixed(2)
      };
    } else {
      return {
        from: numAmount === 0 ? '' : (numAmount / transactionRate).toFixed(2),
        to: amount
      };
    }
  };

  const { from: displayFrom, to: displayTo } = getDisplayValues();

  const swapCurrencies = () => {
    const prevFrom = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(prevFrom);
    setLastChanged(lastChanged === 'from' ? 'to' : 'from');
    setPickerFirstVisibility(false);
    setPickerSecondVisibility(false);
    Keyboard.dismiss();
  };

  const handleTransaction = async () => {
    setMessage({ text: '', type: null });    
    
    const fAmount = parseFloat(displayFrom);
    const tAmount = parseFloat(displayTo);

    if (!fAmount || fAmount <= 0) {
      setMessage({ text: strings.transaction_invalid_amount, type: 'error' });
      return;
    }

    if (!transactionRate) {
      setMessage({ text: strings.transaction_rate_error, type: 'error' });
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${BASE_API_URL}/transaction/exchange`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          fromCurrency: fromCurrency,
          fromAmount: fAmount,
          toCurrency: toCurrency,
          toAmount: tAmount,
          rate: transactionRate
        })
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ text: strings.transaction_success, type: 'success' });
        setTimeout(() => clearMessage(), 5000);
      } else {
        setMessage({ text: strings.transaction_error, type: 'error' });
      }
    } catch (error) {
      console.error("Handle Transaction Error:", error);
      setMessage({ text: strings.transaction_network_error, type: 'error' });
    } finally {
      setLoading(false);
    }
  };


  const clearMessage = () => {
    setMessage({ text: '', type: null });
  };


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
            {strings.transaction_title}
          </ThemedText>
          <ScrollView 
            style={{ flex: 1, width: '100%' }}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.centerAlign}>
              <View style={[styles.transactionWrapper, {backgroundColor: theme.veryLowContrast, borderRadius: 28, paddingTop: 20 }]}>
                <ThemedText
                  type="tiny"
                  style={[{fontFamily: Fonts.bold, color: theme.midContrast}, styles.info]}>
                  {strings.transaction_sell}
                </ThemedText>
                <View style={styles.dataWrapper}>
                  <View>  
                    <TouchableOpacity  onPress={() => {
                        setPickerFirstVisibility(!pickerFirstVisibility);
                        if (!pickerFirstVisibility) { 
                          setPickerSecondVisibility(false);
                        }
                      }} style={{flexDirection: 'row', alignItems: "center", justifyContent: 'center'}}>
                        <ThemedText type="titleSmall" style={{ color: theme.highContrast, marginTop: 3 }}>
                          {getCurrencyData(fromCurrency).flag}
                        </ThemedText>
                        <ThemedText
                            type="titleSmall"
                            style={{fontFamily: Fonts.medium, color: theme.midContrast, paddingLeft: 6}}>
                            {fromCurrency}
                        </ThemedText>
                        <ChevronDownIcon color={theme.midContrast} size={24}></ChevronDownIcon>
                    </TouchableOpacity>
                  
                  </View>
                  <View style={{flexDirection: 'row', alignItems: 'center', gap: 0}}>  
                    <TextInput
                      style={[styles.textInput, { color: theme.highContrast }]}
                      placeholder="0.00"
                      secureTextEntry={false}
                      autoComplete="off"
                      textContentType="none"
                      placeholderTextColor={theme.highContrast}
                      keyboardType="decimal-pad"
                      value={displayFrom} 
                      onChangeText={(val) => {
                        clearMessage();
                        setAmount(val);
                        setLastChanged('from'); 
                      }}
                    />
                    <ThemedText type="titleMid" style={{ color: theme.highContrast, paddingLeft: 3, lineHeight: 32}}>
                      {getCurrencyData(fromCurrency).symbol}
                    </ThemedText>
                  </View>
                </View>

                {pickerFirstVisibility && (
                <View style={[styles.pickerContainer, { borderColor: theme.lowContrast }]}>
                    <Picker
                        selectedValue={fromCurrency}
                        onValueChange={(itemValue) => {
                          clearMessage(); 
                          setFromCurrency(itemValue);
                        }}
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
              </View>

              <TouchableOpacity onPress={swapCurrencies}>
                <ArrowDownUpIcon color={theme.lowContrast} size={24} />
              </TouchableOpacity>

              <View style={[styles.transactionWrapper, {backgroundColor: theme.veryLowContrast, borderRadius: 28, paddingTop: 20 }]}>
                <ThemedText
                  type="tiny"
                  style={[{fontFamily: Fonts.bold, color: theme.midContrast}, styles.info]}>
                  {strings.transaction_buy}
                </ThemedText>
                <View style={styles.dataWrapper}>
                  <View>  
                    <TouchableOpacity 
                      onPress={() => {
                        setPickerSecondVisibility(!pickerSecondVisibility);
                        if (!pickerSecondVisibility) { 
                          setPickerFirstVisibility(false);
                        }
                      }} 
                      style={{flexDirection: 'row', alignItems: "center", justifyContent: 'center'}}
                    >
                        <ThemedText type="titleSmall" style={{ color: theme.highContrast, marginTop: 3 }}>
                          {getCurrencyData(toCurrency).flag}
                        </ThemedText>
                        <ThemedText
                            type="titleSmall"
                            style={{fontFamily: Fonts.medium, color: theme.midContrast, paddingLeft: 6}}>
                            {toCurrency}
                        </ThemedText>
                        <ChevronDownIcon color={theme.midContrast} size={24}></ChevronDownIcon>
                    </TouchableOpacity>
                  
                  </View>
                  <View style={{flexDirection: 'row', alignItems: 'center', gap: 0}}>  
                    <TextInput
                      style={[styles.textInput, { color: theme.highContrast }]}
                      placeholder="0.00"
                      secureTextEntry={false}
                      autoComplete="off"
                      textContentType="none"
                      placeholderTextColor={theme.highContrast}
                      keyboardType="decimal-pad"
                      value={displayTo} 
                      onChangeText={(val) => {
                        clearMessage();
                        setAmount(val);
                        setLastChanged('to'); 
                      }}
                    />
                    <ThemedText type="titleMid" style={{ color: theme.highContrast, paddingLeft: 3, lineHeight: 32}}>
                      {getCurrencyData(toCurrency).symbol}
                    </ThemedText>
                  </View>
                </View>

                {pickerSecondVisibility && (
                <View style={[styles.pickerContainer, { borderColor: theme.lowContrast }]}>
                    <Picker
                        selectedValue={toCurrency}
                        onValueChange={(itemValue) => {
                          clearMessage(); 
                          setToCurrency(itemValue);
                        }}
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
              </View>

              <ThemedText
                type="textSmall"
                style={[{fontFamily: Fonts.regular, color: theme.lowContrast}, styles.disclaimer]}>
                {strings.transaction_disclaimer}
              </ThemedText>

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
            
          </ScrollView>
          <View style={styles.buttonWrapper}>
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: theme.highContrast }]} 
              onPress={handleTransaction}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={theme.background} />
              ) : (
                <ThemedText type='default' style={{ color: theme.accentDark }}>
                  {strings.transaction_button}
                </ThemedText>
              )}
            </TouchableOpacity>
          </View>
        </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: '4%',
    paddingTop: '32%',
    gap: 16
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
  centerAlign: {
    alignItems: 'center',
    gap: 16,
  },
  transactionWrapper: {
    width: '88%',
    paddingVertical: 12,
  },
  info: {
    alignSelf: 'flex-end',
    marginRight: '8%',
  },
  dataWrapper: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  textInput: {
    fontFamily: Fonts.bold, 
    fontSize: 28, 
    lineHeight: 34,
    paddingHorizontal: 2,
  },
  pickerContainer: {
    width: '88%',
    height: 160,
    borderWidth: 2,
    borderRadius: 24,
    overflow: 'hidden',
    justifyContent: 'center', 
    alignSelf: 'center',
    marginBottom: 4,
  },
  disclaimer: {
    alignSelf: 'center',
    textAlign: 'center', 
    paddingHorizontal: '10%',
  }, 
  messageContainer: {
    marginVertical: 10, 
    paddingHorizontal: 20
  },
  message: {
    textAlign: 'center',
  },
  buttonWrapper: {
    paddingVertical: 24,
    paddingHorizontal: '6%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});