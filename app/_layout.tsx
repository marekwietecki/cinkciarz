import { SplashScreen, Stack, Redirect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import React, { useContext, useEffect } from 'react';
import { LanguageProvider } from '../contexts/languageContext';
import { ThemeProvider } from '../contexts/themeContext';
import { AuthContext, AuthProvider } from '../contexts/authContext';
import { useFonts } from 'expo-font';

export const Fonts = {
  thin: 'Lexend-Thin',
  extraLight: 'Lexend-ExtraLight',
  light: 'Lexend-Light',
  regular: 'Lexend-Regular',
  medium: 'Lexend-Medium',
  semiBold: 'Lexend-SemiBold',
  bold: 'Lexend-Bold',
  extraBold: 'Lexend-ExtraBold',
  black: 'Lexend-Black',
};  

export const unstable_settings = {
  anchor: '(tabs)',
};


function RootNavigation() {
  const { token, isLoading } = useContext(AuthContext);
  
  if (isLoading) return null;

  return (
    <Stack>
      <Stack.Screen 
        name="(auth)" 
        options={{ 
          headerShown: false 
        }}
      />
      <Stack.Screen 
        name="account/changePassword" 
        options={{ 
          headerShown: false 
        }}
      />
      <Stack.Screen 
        name="account/deleteAccount" 
        options={{ 
          headerShown: false 
        }}
      />
      <Stack.Screen 
        name="(tabs)" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="modal" 
        options={{ presentation: 'modal', title: 'Modal' }} 
      />
      <Stack.Screen 
        name="profile" 
        options={{ 
          headerShown: false
        }}   
      />
    </Stack>
  );
}

export default function RootLayout() {

  const [loaded] = useFonts({
    [Fonts.thin]: require('../assets/fonts/Lexend-Thin.ttf'),
    [Fonts.extraLight]: require('../assets/fonts/Lexend-ExtraLight.ttf'),
    [Fonts.light]: require('../assets/fonts/Lexend-Light.ttf'),
    [Fonts.regular]: require('../assets/fonts/Lexend-Regular.ttf'),
    [Fonts.medium]: require('../assets/fonts/Lexend-Medium.ttf'),
    [Fonts.semiBold]: require('../assets/fonts/Lexend-SemiBold.ttf'),
    [Fonts.bold]: require('../assets/fonts/Lexend-Bold.ttf'),
    [Fonts.extraBold]: require('../assets/fonts/Lexend-ExtraBold.ttf'),
    [Fonts.black]: require('../assets/fonts/Lexend-Black.ttf'),
  });

  useEffect(() => {
    async function prepare() {
      await SplashScreen.preventAutoHideAsync();
    }
    prepare();
  }, []);

  if (!loaded) return null;

  return (
    <AuthProvider>
    <LanguageProvider>
      <ThemeProvider>
        <RootNavigation />
        <StatusBar style="auto" />
      </ThemeProvider>
    </LanguageProvider>
    </AuthProvider>
  );
}
