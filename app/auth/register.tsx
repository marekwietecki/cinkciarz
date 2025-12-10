import { ThemedText } from '@/components/themed-text';
import React, { useContext, useState } from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { useRouter } from 'expo-router';
import { LanguageContext } from '../../contexts/languageContext';
import { ThemeContext } from '../../contexts/themeContext';
import { Fonts } from '../_layout';

const BASE_URL = 'http://192.168.18.9:19000/api/auth';

export default function RegisterScreen() {
  const router = useRouter();
  const { strings } = useContext(LanguageContext);
  const { theme } = useContext(ThemeContext);
 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if(!email || !password || !confirmPassword){
        Alert.alert(strings.error, strings.register_fields_required);
        return;
    }
    if(password !== confirmPassword) {
        Alert.alert(strings.error, strings.register_password_mismatch);
        setPassword('');
        setConfirmPassword('');
        return;
    }

    setLoading(true);

    try{
        const response = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            Alert.alert(strings.success, data.message || strings.register_success_message);
            router.push('./auth/login');
        } else {
            const errorMessage = data.message || strings.register_unknown_error;
            Alert.alert(strings.error, errorMessage);
        }
    } catch (error) {
        console.log(error);
        Alert.alert(strings.error, strings.register_network_error);
    } finally {
        setLoading(false);
    }
  }


  return (
    <View style={[
      styles.container,
      { backgroundColor: theme.background }
    ]}>
      <TouchableOpacity style={[styles.profileLink, {backgroundColor: theme.veryLowContrast}]} onPress={() => router.push('../profile')}>
        <ThemedText>🙍‍♂️</ThemedText>
      </TouchableOpacity>
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
            <TouchableOpacity style={[styles.textInputWrapper, { borderColor: theme. lowContrast}]}>
                <TextInput 
                    placeholder={strings.register_email_example} 
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
                <ThemedText type="titleSmall" style={{color: theme.highContrast}}>{strings.register_password}</ThemedText>
            </View>  
            <TouchableOpacity style={[styles.textInputWrapper, { borderColor: theme. lowContrast}]}>
                <TextInput 
                    placeholder={strings.register_password_example} 
                    placeholderTextColor={theme.lowContrast} 
                    style={[styles.textInput, {color: theme.highContrast}]}
                    onChangeText={setPassword}
                    value={password}
                    secureTextEntry={true}
                />
            </TouchableOpacity>
          </View>
          <View style={styles.singleInputContainer}>
            <View style={styles.titleSmallContainer}>
                <ThemedText type="titleSmall">🔁</ThemedText>
                <ThemedText type="titleSmall" style={{color: theme.highContrast}}>{strings.register_repeat_password}</ThemedText>
            </View>  
            <TouchableOpacity style={[styles.textInputWrapper, { borderColor: theme. lowContrast}]}>
                <TextInput
                    placeholder={strings.register_password_example} 
                    placeholderTextColor={theme.lowContrast} 
                    style={[styles.textInput, {color: theme.highContrast}]}
                    onChangeText={setConfirmPassword}
                    value={confirmPassword}
                    secureTextEntry={true}
                />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
            style={[styles.button, {backgroundColor: theme.buttonBg}]}
            onPress={handleRegister}
            disabled={loading}    
        >
            <ThemedText type='default' style={{ color: theme.buttonText }}>
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
