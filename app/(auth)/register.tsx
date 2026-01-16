import { ThemedText } from '@/components/themed-text';
import React, { useContext, useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { LanguageContext } from '../../contexts/languageContext';
import { ThemeContext } from '../../contexts/themeContext';
import { Fonts } from '../_layout';
import { useNetInfo } from '@react-native-community/netinfo';

import { BASE_API_URL } from '@/config';

export default function RegisterScreen() {
  const router = useRouter();
  const { strings } = useContext(LanguageContext);
  const { theme } = useContext(ThemeContext);
  const { deleted } = useLocalSearchParams();
 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' | null}>({ text: '', type: null});
  const [loading, setLoading] = useState(false);
  const netInfo = useNetInfo();
  const isOffline = netInfo.isConnected === false; 

  useEffect(() => {
      if (deleted === 'true') {
        setMessage({ text: strings.delete_success, type: 'success' });
        
        const timer = setTimeout(() => {
          setMessage({ text: '', type: null });
        }, 5000);
  
        return () => clearTimeout(timer);
      }
    }, [deleted, strings.delete_success]);

  const handleRegister = async () => {
    setMessage({ text: '', type: null });    

    if(!email || !password || !confirmPassword){
      setMessage({ text: strings.register_fields_required, type: 'error' })
      return;
    }
    if(password !== confirmPassword) {
        setMessage({ text: strings.register_password_mismatch, type: 'error' })
        setPassword('');
        setConfirmPassword('');
        return;
    }

    setLoading(true);

    try{
        const response = await fetch(`${BASE_API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            router.replace({
              pathname: './login',
              params: { registered: 'true' }
            });
        } else {
            const errorMessage = data.message || strings.register_unknown_error;
            setMessage({ text: errorMessage, type: 'error' });
        }
    } catch (error) {
        console.log(error);
        setMessage({ text: strings.register_network_error, type: 'error' });
    } finally {
        setLoading(false);
    }
  }

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

  const handleSetConfirmPassword = (text: string) => {
      clearMessage();
      setConfirmPassword(text);
  };

  useEffect(() => {
    if (isOffline) {
      setMessage({ text: strings.register_offline_error, type: 'error' });
    } else {
      setMessage((prev) => 
        prev.text === strings.register_offline_error ? { text: '', type: null } : prev
      );
    }
  }, [isOffline, strings.register_offline_error]);

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: theme.background, alignItems: 'center' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={-64}
    >
      <ScrollView 
        contentContainerStyle={[ 
          styles.container,
          { backgroundColor: theme.background } 
        ]}
        keyboardShouldPersistTaps="handled" 
      >
        <View style={styles.titleContainer}>
          <ThemedText type="titleMid" style={{color: theme.highContrast}}>{strings.register_title}</ThemedText>
          <ThemedText type="subtitle" style={{color: theme.midContrast}}>{strings.register_subtitle}</ThemedText>
        </View>

        <View style={styles.mainContainer}>
          <View style={styles.inputsContainer}>
            <View style={styles.singleInputContainer}>
              <View style={styles.titleSmallContainer}>
                <ThemedText type="titleSmall">✉️</ThemedText>
                <ThemedText type="titleSmall" style={{color: theme.highContrast}}>{strings.register_email}</ThemedText>
              </View>  
                <TextInput 
                    placeholder={strings.register_email_example} 
                    placeholderTextColor={theme.lowContrast} 
                    style={[styles.textInput, {color: theme.highContrast, borderColor: theme. lowContrast }]}
                    onChangeText={handleSetEmail}
                    value={email}
                    keyboardType='email-address'
                    autoCapitalize='none'
                    editable={!isOffline && !loading}
                />
            </View>
            <View style={styles.singleInputContainer}>
              <View style={styles.titleSmallContainer}>
                  <ThemedText type="titleSmall">🔑</ThemedText>
                  <ThemedText type="titleSmall" style={{color: theme.highContrast}}>{strings.register_password}</ThemedText>
              </View>  
                <TextInput 
                    placeholder={strings.register_password_example} 
                    placeholderTextColor={theme.lowContrast} 
                    style={[styles.textInput, {color: theme.highContrast, borderColor: theme. lowContrast }]}
                    onChangeText={handleSetPassword}
                    value={password}
                    secureTextEntry={true}
                    editable={!isOffline && !loading}
                />
            </View>
            <View style={styles.singleInputContainer}>
              <View style={styles.titleSmallContainer}>
                  <ThemedText type="titleSmall">🔁</ThemedText>
                  <ThemedText type="titleSmall" style={{color: theme.highContrast}}>{strings.register_repeat_password}</ThemedText>
              </View>  
              <TextInput
                  placeholder={strings.register_password_example} 
                  placeholderTextColor={theme.lowContrast} 
                  style={[styles.textInput, {color: theme.highContrast, borderColor: theme. lowContrast}]}
                  onChangeText={handleSetConfirmPassword}
                  value={confirmPassword}
                  secureTextEntry={true}
                  editable={!isOffline && !loading}
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
              style={[styles.button, {backgroundColor: theme.highContrast, opacity: (loading || isOffline) ? 0.2 : 1}]}
              onPress={handleRegister}
              disabled={loading || isOffline}    
          >
              <ThemedText type='default' style={{ color: theme.accentDark }}>
                  {loading ? strings.register_loading : strings.register_button}
              </ThemedText>
          </TouchableOpacity>

          <View style={styles.textsSmallContainer}>
              <ThemedText type='textSmall' style={{color: theme.highContrast}}>{strings.register_have_an_account}</ThemedText>
              <TouchableOpacity onPress={() => router.push('./login')}>
                  <ThemedText type='textSmallSemiBold' style={{color: theme.highContrast}}>{strings.register_login}</ThemedText>
              </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: '8%',
    paddingBottom: '4%',
    maxWidth: 480, 
    flexGrow: 1,
  },
  profileLink: {
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 50,
    position: 'absolute', 
    top: '8%', 
    left: '8%',
  },
  titleContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  titleSmallContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap:8,
  },
  mainContainer: {
    gap: 8,
    marginBottom: 24,
    marginTop: 36,
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
    overflow: 'hidden'
  },
  inputsContainer: {
    gap: 16,
    marginBottom: 12,
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
    paddingVertical: 16,
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
