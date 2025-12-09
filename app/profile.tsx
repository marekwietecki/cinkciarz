import { useRouter } from 'expo-router';
import React, { useContext } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { LanguageContext } from '../contexts/languageContext';
import { ThemeContext } from '../contexts/themeContext';


export default function WelcomeScreen() {
  const router = useRouter();
  const { lang, setLang, strings } = useContext(LanguageContext);
  const { themeName, setThemeName, theme } = useContext(ThemeContext);

  return (
    <View style={[ styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text, fontSize: 24 }]}>
        Locales
      </Text>

      <Text style={[styles.label, { color: theme.text }]}>
        {strings.choose_language}
      </Text>
      <View style={styles.row}>
        <TouchableOpacity style={[styles.button, {backgroundColor: lang === 'pl' ? theme.buttonBg : theme.card }]} onPress={() => setLang('pl')}>
          <Text style={[styles.buttonText, { color: lang === 'pl' ? theme.buttonText : theme.text }]}>
            {strings.polish}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, {backgroundColor: lang === 'en' ? theme.buttonBg : theme.card }]} onPress={() => setLang('en')}>
          <Text style={[styles.buttonText, { color: lang === 'en' ? theme.buttonText : theme.text }]}>
            {strings.english}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.label, { color: theme.text }]}>
        {strings.choose_theme}
      </Text>
      <View style={styles.row}>
        <TouchableOpacity style={[styles.button, {backgroundColor: themeName === 'light' ? theme.buttonBg : theme.card }]} onPress={() => setThemeName('light')}>
          <Text style={[styles.buttonText, { color: themeName === 'light' ? theme.buttonText : theme.text }]}>
            {strings.light_theme}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, {backgroundColor: themeName === 'dark' ? theme.buttonBg : theme.card }]} onPress={() => setThemeName('dark')}>
          <Text style={[styles.buttonText, { color: themeName === 'dark' ? theme.buttonText : theme.text }]}>
            {strings.dark_theme}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.startBtn} onPress={() => router.push('/')}>
        <Text style={[ styles.startBtnText, { color: theme.text}]}>
          Przejdź do loginu
        </Text>
      </TouchableOpacity>
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    paddingBottom: 16,
  },
  label: { 
    fontSize: 16, 
    marginTop: 12, 
    marginBottom: 8,
  },
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-between' 
  },
  button: { 
    flex: 1, 
    padding: 12, 
    margin: 6, 
    borderRadius: 8, 
    alignItems: 'center' 
  },
  buttonText: {
    fontWeight: '600',

  },
  startBtn: { 
    marginTop: 24, 
    padding: 14, 
    borderRadius: 10, 
    alignItems: 'center',
  },
  startBtnText: {
    fontWeight: '600',
    fontSize: 18,
  }
});
