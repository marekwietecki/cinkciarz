import { ActivityIndicator, Keyboard, ScrollView, StyleSheet, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import React, { useCallback, useContext, useState } from 'react';
import { ThemeContext } from '../../contexts/themeContext';
import { LanguageContext } from '../../contexts/languageContext';
import { useFocusEffect, useRouter } from 'expo-router';
import { Fonts } from '../_layout';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { ChevronDownIcon, MoveDownIcon } from '@/components/Icons';
import currenciesJson from '../../backend/currencies.json';

const AVATAR_KEY = 'userAvatar';
const BASE_URL = 'http://192.168.18.9:4000/api';




export default function WalletScreen() {
  const router = useRouter();
  const { strings } = useContext(LanguageContext);
  const { theme } = useContext(ThemeContext);
  
  const [avatar, setAvatar] = useState('');
  const [loading, setLoading] = useState(false);
  const [pickerVisibility, setPickerVisibility] = useState(false);

  const [fromCurrency, setFromCurrency] = useState('PLN');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [toRate, setToRate] = useState<number | null>(null);
  const [fromRate, setFromRate] = useState<number | null>(null);
  const [transactionRate, setTransactionRate] = useState<number | null>(null);
  const [amount, setAmount] = useState('');
  const [convertedAmount, setConvertedAmount] = useState('0.00');

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

  const fetchRate = useCallback(async (fromCurrency: string) => {
    if (fromCurrency === 'PLN') return 1; 
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/rate/A/${fromCurrency}`);
      const result = await response.json();

      if (result.success && result.data.length > 0) {
        return result.data[result.data.length - 1].rate;
      }
      return 1;
    } catch (error) {
      console.error(`Błąd kursu ${fromCurrency}:`, error);
      return 1;
    } finally {
      setLoading(false);
    }
  }, []);


  const calculateTransactionRate = useCallback(async () => {
    const fRate = await fetchRate(fromCurrency);
    const tRate = await fetchRate(toCurrency);
   
    setFromRate(fRate);
    setToRate(tRate);
    
    const finalRate = fRate / tRate;
  
    setTransactionRate(finalRate);

  }, [fromCurrency, toCurrency, fetchRate]);


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
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.centerAlign}>
              <View style={[styles.transactionWrapper, {backgroundColor: theme.veryLowContrast, borderRadius: 28, paddingTop: 20 }]}>
                <ThemedText
                  type="tiny"
                  style={[{fontFamily: Fonts.bold, color: theme.highContrast}, styles.info]}>
                  {strings.transaction_sell}
                </ThemedText>
                <View style={styles.dataWrapper}>
                  <View>  
                    <TouchableOpacity onPress={() => setPickerVisibility(!pickerVisibility)} style={{flexDirection: 'row', alignItems: "center", justifyContent: 'center'}}>
                        <ThemedText type="titleSmall" style={{ color: theme.highContrast, marginTop: 3 }}>
                          {getCurrencyData(fromCurrency).flag}
                        </ThemedText>
                        <ThemedText
                            type="titleSmall"
                            style={{fontFamily: Fonts.medium, color: theme.lowContrast, paddingLeft: 6}}>
                            {fromCurrency}
                        </ThemedText>
                        <ChevronDownIcon color={theme.lowContrast} size={24}></ChevronDownIcon>
                    </TouchableOpacity>
                  
                  </View>
                  <View style={{flexDirection: 'row', alignItems: 'center', gap: 0}}>  
                    <TextInput
                        style={[styles.textInput, { color: theme.highContrast }]}
                        placeholder="0.00"
                        placeholderTextColor={theme.highContrast}
                        keyboardType="decimal-pad"
                        value={amount}
                        onChangeText={setAmount}
                    />
                    <ThemedText type="titleMid" style={{ color: theme.highContrast, marginTop: 3, paddingLeft: 3 }}>
                      {getCurrencyData(fromCurrency).symbol}
                    </ThemedText>
                  </View>
                </View>

                {pickerVisibility && (
                <View style={[styles.pickerContainer, { borderColor: theme.lowContrast }]}>
                    <Picker
                        selectedValue={fromCurrency}
                        onValueChange={(itemValue) => setFromCurrency(itemValue)}
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

              <MoveDownIcon color={theme.lowContrast} size={24}></MoveDownIcon>

              <View style={[styles.transactionWrapper, {backgroundColor: theme.veryLowContrast, borderRadius: 28, paddingTop: 20 }]}>
                <ThemedText
                  type="tiny"
                  style={[{fontFamily: Fonts.bold, color: theme.highContrast}, styles.info]}>
                  {strings.transaction_buy}
                </ThemedText>
                <View style={styles.dataWrapper}>
                  <View>  
                    <TouchableOpacity onPress={() => setPickerVisibility(!pickerVisibility)} style={{flexDirection: 'row', alignItems: "center", justifyContent: 'center'}}>
                        <ThemedText type="titleSmall" style={{ color: theme.highContrast, marginTop: 3 }}>
                          {getCurrencyData(toCurrency).flag}
                        </ThemedText>
                        <ThemedText
                            type="titleSmall"
                            style={{fontFamily: Fonts.medium, color: theme.lowContrast, paddingLeft: 6}}>
                            {toCurrency}
                        </ThemedText>
                        <ChevronDownIcon color={theme.lowContrast} size={24}></ChevronDownIcon>
                    </TouchableOpacity>
                  
                  </View>
                  <View style={{flexDirection: 'row', alignItems: 'center', gap: 0}}>  
                    <TextInput
                        style={[styles.textInput, { color: theme.highContrast }]}
                        placeholder="0.00"
                        placeholderTextColor={theme.highContrast}
                        keyboardType="decimal-pad"
                        value={amount}
                        onChangeText={setAmount}
                    />
                    <ThemedText type="titleMid" style={{ color: theme.highContrast, marginTop: 3, paddingLeft: 3 }}>
                      {getCurrencyData(toCurrency).symbol}
                    </ThemedText>
                  </View>
                </View>

                {pickerVisibility && (
                <View style={[styles.pickerContainer, { borderColor: theme.lowContrast }]}>
                    <Picker
                        selectedValue={fromCurrency}
                        onValueChange={(itemValue) => setFromCurrency(itemValue)}
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
            </View>
          </ScrollView>
          <View style={styles.buttonWrapper}>
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: theme.highContrast }]} 
              //onPress={{handleTransaction}}
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
    lineHeight: 37.24,
    paddingVertical: 12,
    paddingHorizontal: 2,
  },
  pickerContainer: {
    width: '88%',
    height: '36%',
    borderWidth: 2,
    borderRadius: 24,
    overflow: 'hidden',
    justifyContent: 'center', 
    alignSelf: 'center'
  },
  disclaimer: {
    alignSelf: 'center',
    textAlign: 'center', 
    marginBottom: '4%',
    paddingHorizontal: '10%',
  }, 
  buttonWrapper: {
    paddingVertical: 20,
    paddingHorizontal: '6%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginVertical: 16,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 24
  },
});