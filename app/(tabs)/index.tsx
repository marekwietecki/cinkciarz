import { ThemedText } from '@/components/themed-text';
import React, { useCallback, useContext, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { useRouter, useFocusEffect } from 'expo-router';
import { ThemeContext } from '../../contexts/themeContext';
import { Fonts } from '../_layout';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AVATAR_KEY = 'userAvatar';

export default function DashboardScreen() {
  const router = useRouter();
  const { theme } = useContext(ThemeContext);
      
  const [ avatar, setAvatar ] = useState('');
  
  const loadAvatar = async () => {
    try {
      const storedAvatar = await AsyncStorage.getItem(AVATAR_KEY);
      if (storedAvatar) {
        setAvatar(storedAvatar);
      } else {
        setAvatar('');
      }
    } catch (e) {
      console.error('Błąd ładowania avatara:', e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadAvatar();
    }, [])
  );

  return (
    <View style={[
      styles.container,
      { backgroundColor: theme.background }
    ]}>
      <TouchableOpacity style={[styles.profileLink, { backgroundColor: theme.veryLowContrast }]} onPress={() => router.push('../profile')}>
        <ThemedText type="titleSmall">{avatar}</ThemedText>
      </TouchableOpacity>
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
