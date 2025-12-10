import { ThemedText } from '@/components/themed-text';
import React, { useContext, useState } from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { useRouter } from 'expo-router';
import { LanguageContext } from '../../contexts/languageContext';
import { ThemeContext } from '../../contexts/themeContext';
import { Fonts } from '../_layout';
import AsyncStorage from '@react-native-async-storage/async-storage'

const BASE_URL = 'http://192.168.18.9:19000/api/auth';

export default function HomeScreen() {
  const router = useRouter();
  const { strings } = useContext(LanguageContext);
  const { theme } = useContext(ThemeContext);
 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleLogin = async () => {
    if (!email || !password){
      Alert.alert(strings.error, strings.login_fields_required);
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }), 
      });

      const data = await response.json();

      if (response.ok) {
        const token = data.token;
        if(token) {
          await AsyncStorage.setItem('userToken', token);

          Alert.alert(strings.success, strings.login_success_message);
          router.replace('/');
        } else {
          //no token
          Alert.alert(strings.error, strings.login_token_error);
        }
      } else {
        //400 401
        const errorMessage = data.message || strings.login_unknown_error;
        Alert.alert(strings.error, errorMessage);
        setPassword('');
      }
    } catch (error) {
      //sieci
      console.error("Błąd logowania:", error);
      Alert.alert(strings.error, strings.login_network_error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[
      styles.container,
      { backgroundColor: theme.background } 
    ]}>
      <TouchableOpacity style={[styles.profileLink, {backgroundColor: theme.veryLowContrast}]} onPress={() => router.push('../profile')}>
        <ThemedText>🙍‍♂️</ThemedText>
      </TouchableOpacity>
      <View style={styles.titleContainer}>
        <ThemedText type="titleMid" style={{color: theme.highContrast}}>{strings.login_title}</ThemedText>
        <ThemedText type="subtitle" style={{color: theme.midContrast}}>{strings.login_subtitle}</ThemedText>
      </View>

      <View style={styles.mainContainer}>
        <View style={styles.inputsContainer}>
          <View style={styles.singleInputContainer}>
            <View style={styles.titleSmallContainer}>
              <ThemedText type="titleSmall">✉️</ThemedText>
              <ThemedText type="titleSmall" style={{color: theme.highContrast}}>{strings.login_email}</ThemedText>
            </View>  
            <TouchableOpacity style={[styles.textInputWrapper, { borderColor: theme. lowContrast}]}>
              <TextInput 
                placeholder={strings.login_email_example} 
                placeholderTextColor={theme.lowContrast} 
                style={[styles.textInput, {color: theme.highContrast}]}
                onChangeText={setEmail}
                value={email}
                keyboardType='email-address'
                autoCapitalize='none'
              />
            </TouchableOpacity>
          </View>
          <View style={styles.singleInputContainer}>
            <View style={styles.titleSmallContainer}>
              <ThemedText type="titleSmall">🔑</ThemedText>
              <ThemedText type="titleSmall" style={{color: theme.highContrast}}>{strings.login_password}</ThemedText>
            </View>  
            <TouchableOpacity style={[styles.textInputWrapper, { borderColor: theme. lowContrast}]}>
              <TextInput 
                placeholder={strings.login_password_example} 
                placeholderTextColor={theme.lowContrast} 
                style={[styles.textInput, {color: theme.highContrast}]}
                onChangeText={setPassword}
                value={password}
                secureTextEntry={true}
              />
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity 
          style={[styles.button, {backgroundColor: theme.buttonBg}]}
          onPress={handleLogin}
          disabled={loading}
        >
          <ThemedText type='default' style={{ color: theme.buttonText }}>
            {loading ? strings.login_loading : strings.login_button}
          </ThemedText>
        </TouchableOpacity>

        <View style={styles.textsSmallContainer}>
          <ThemedText type='textSmall' style={{color: theme.highContrast}}>{strings.login_no_account}</ThemedText>
          <TouchableOpacity onPress={() => router.push('./register')}>
            <ThemedText type='textSmallSemiBold' style={{color: theme.highContrast}}>{strings.login_register}</ThemedText>
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: '8%',
    paddingBottom: '8%',
  },
  profileLink: {
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 50,
    position: 'absolute', 
    top: '10%', 
    left: '8%',
  },
  titleContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
  },
  titleSmallContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap:8,
  },
  mainContainer: {
    gap: 8,
    marginBottom: 24,
    marginTop: 48,
    width: '100%',
  },
  textInput: {
    fontFamily: Fonts.regular, 
    fontSize: 16, 
    lineHeight: 20,
  },
  textInputWrapper: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 3,
    borderRadius: 32,
  },
  inputsContainer: {
    gap: 16,
    marginBottom: 40,
  },
  singleInputContainer: {
    gap: 4,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textsSmallContainer: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
