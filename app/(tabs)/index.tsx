import { Image } from 'expo-image';
import { StyleSheet, View, TextInput, TouchableOpacity, useColorScheme, } from 'react-native';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import React, { useContext } from 'react';
import { Colors } from '@/constants/theme';

import { LanguageContext } from '../contexts/languageContext';
import { ThemeContext } from '../contexts/themeContext';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const scheme = useColorScheme() ?? 'light';
  const router = useRouter();
  const { strings } = useContext(LanguageContext);
  const { theme } = useContext(ThemeContext);
 
  
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <View style={[
        styles.container,
        { backgroundColor: Colors[scheme].background } // dynamiczne tło
      ]}>
        <View style={styles.titleContainer}>
          <ThemedText type="titleMid">{strings.login_title}</ThemedText>
          <ThemedText type="subtitle">{strings.login_subtitle}</ThemedText>
        </View>
        <View style={styles.mainContainer}>
          <View style={styles.titleSmallContainer}>
            <ThemedText type="titleSmall">✉️</ThemedText>
            <ThemedText type="titleSmall">{strings.login_email}</ThemedText>
          </View>  
          <View style={styles.inputsContainer}>
            <TouchableOpacity style={[styles.textInputWrapper, { borderColor: theme. midContrast}]}>
              <TextInput placeholder={strings.login_email_example}></TextInput>
            </TouchableOpacity>
            <View style={styles.titleSmallContainer}>
              <ThemedText type="titleSmall">🔑</ThemedText>
              <ThemedText type="titleSmall">{strings.login_password}</ThemedText>
            </View>  
            <TouchableOpacity style={[styles.textInputWrapper, { borderColor: theme. midContrast}]}>
              <TextInput placeholder={strings.login_password_example}></TextInput>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={[styles.button, {backgroundColor: theme.buttonBg}]}>
            <ThemedText type='default' style={{ color: theme.buttonText }}>{strings.login_button}</ThemedText>
          </TouchableOpacity>
          <View style={styles.textsSmallContainer}>
            <ThemedText type='textSmall'>{strings.login_no_account}</ThemedText>
            <TouchableOpacity onPress={() => router.push('./profile')}>
              <ThemedText type='textSmallSemiBold'>{strings.login_register}</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  textInputWrapper: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 3,
    borderRadius: 32,
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
    gap: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainContainer: {
    gap: 8,
    marginBottom: 24,
    marginTop: 48,
    width: '100%',
  },
  inputsContainer: {
    gap: 16,
    marginBottom: 40,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
