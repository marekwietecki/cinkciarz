import { ThemedText } from '@/components/themed-text';
import React, { useContext } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { useRouter } from 'expo-router';
import { LanguageContext } from '../../contexts/languageContext';
import { ThemeContext } from '../../contexts/themeContext';
import { Fonts } from '../_layout';

export default function HomeScreen() {
  const router = useRouter();
  const { strings } = useContext(LanguageContext);
  const { theme } = useContext(ThemeContext);
 
  
  return (
    <View style={[
      styles.container,
      { backgroundColor: theme.background }
    ]}>
      <TouchableOpacity style={[styles.profileLink, {backgroundColor: theme.veryLowContrast}]} onPress={() => router.push('./profile')}>
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
              <TextInput placeholder={strings.register_email_example} placeholderTextColor={theme.lowContrast} style={[styles.textInput, {color: theme.highContrast}]}></TextInput>
            </TouchableOpacity>
          </View>
          <View style={styles.singleInputContainer}>
            <View style={styles.titleSmallContainer}>
              <ThemedText type="titleSmall">🔑</ThemedText>
              <ThemedText type="titleSmall" style={{color: theme.highContrast}}>{strings.register_password}</ThemedText>
            </View>  
            <TouchableOpacity style={[styles.textInputWrapper, { borderColor: theme. lowContrast}]}>
              <TextInput placeholder={strings.register_password_example} placeholderTextColor={theme.lowContrast} style={[styles.textInput, {color: theme.highContrast}]}></TextInput>
            </TouchableOpacity>
          </View>
          <View style={styles.singleInputContainer}>
            <View style={styles.titleSmallContainer}>
              <ThemedText type="titleSmall">🔁</ThemedText>
              <ThemedText type="titleSmall" style={{color: theme.highContrast}}>{strings.register_repeat_password}</ThemedText>
            </View>  
            <TouchableOpacity style={[styles.textInputWrapper, { borderColor: theme. lowContrast}]}>
              <TextInput placeholder={strings.register_password_example} placeholderTextColor={theme.lowContrast} style={[styles.textInput, {color: theme.highContrast}]}></TextInput>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity style={[styles.button, {backgroundColor: theme.buttonBg}]}>
          <ThemedText type='default' style={{ color: theme.buttonText }}>{strings.register_button}</ThemedText>
        </TouchableOpacity>

        <View style={styles.textsSmallContainer}>
          <ThemedText type='textSmall' style={{color: theme.highContrast}}>{strings.register_have_an_account}</ThemedText>
          <TouchableOpacity onPress={() => router.push('./auth/login')}>
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
