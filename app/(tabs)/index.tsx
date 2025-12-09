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
        <TouchableOpacity onPress={() => router.push('./auth/register')}>
          <ThemedText type='titleMid' style={{color: theme.highContrast}}>Register</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('./auth/login')}>
          <ThemedText type='titleMid' style={{color: theme.highContrast}}>Login</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('./profile')}>
          <ThemedText type='titleMid' style={{color: theme.highContrast}}>Profile</ThemedText>
        </TouchableOpacity>
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
