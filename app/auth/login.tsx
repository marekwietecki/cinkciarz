import { ThemedText } from '@/components/themed-text';
import React, { useContext, useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';

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
  const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' | null}>({ text: '', type: null});
  const [loading, setLoading] = useState(false);
  
  const handleLogin = async () => {
    setMessage({ text: '', type: null });    
    
    if (!email || !password){
      setMessage({ text: strings.login_fields_required, type: 'error' });
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

          setMessage({ text: strings.login_success_message, type: 'success' })
          router.replace('/');
        } else {
          //no token
          setMessage({text: strings.login_token_error, type: 'error'})
        }
      } else {
        //400 401
        const errorMessage = data.message || strings.login_unknown_error;
        setMessage({ text: errorMessage, type: 'error'})
        setPassword('');
      }
    } catch (error) {
      //sieci
      console.error("Błąd logowania:", error);
      setMessage({ text: strings.login_network_error, type: 'error'})
    } finally {
      setLoading(false);
    }
  };

  const clearMessage = () => {
    setMessage({ text: '', type: null });
  };

  const handleSetEmail = (text: string) => {
      clearMessage();
      setEmail(text);
  };

  const handleSetPassword = (text: string) => {
      clearMessage();
      setPassword(text);
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0} 
    >
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
              <TextInput 
                  placeholder={strings.login_email_example} 
                  placeholderTextColor={theme.lowContrast} 
                  style={[styles.textInput, { color: theme.highContrast, borderColor: theme. lowContrast }]}
                  onChangeText={handleSetEmail}
                  value={email}
                  keyboardType='email-address'
                  autoCapitalize='none'
                />
            </View>
            <View style={styles.singleInputContainer}>
              <View style={styles.titleSmallContainer}>
                <ThemedText type="titleSmall">🔑</ThemedText>
                <ThemedText type="titleSmall" style={{color: theme.highContrast}}>{strings.login_password}</ThemedText>
              </View>  
              <TextInput 
                placeholder={strings.login_password_example} 
                placeholderTextColor={theme.lowContrast} 
                style={[styles.textInput, { color: theme.highContrast, borderColor: theme. lowContrast }]}
                onChangeText={handleSetPassword}
                value={password}
                secureTextEntry={true}
              />
            </View>
          </View>

          {message.type && message.text ? (
            <View style={ styles.messageContainer }>
              <ThemedText 
                type="default"
                style={[styles.message, {color: message.type === 'error' ? theme.failure : theme.success || 'green',}]} 
              >
                {message.text}  
              </ThemedText>  
            </View>
          ) : null}

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
    </KeyboardAvoidingView>
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
    marginTop: 40,
    width: '100%',
  },
  textInput: {
    fontFamily: Fonts.regular, 
    fontSize: 16, 
    lineHeight: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderRadius: 32,
  },
  inputsContainer: {
    gap: 16,
    marginBottom: 28,
  },
  singleInputContainer: {
    gap: 4,
  },
  messageContainer: {
    marginVertical: 10, 
    paddingHorizontal: 20
  },
  message: {
    textAlign: 'center',
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
