import { useRouter } from 'expo-router';
import React, { useContext } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { LanguageContext } from '../contexts/languageContext';
import { ThemeContext } from '../contexts/themeContext';
import { ThemedText } from '@/components/themed-text';


export default function WelcomeScreen() {
    const router = useRouter();
    const { lang, setLang, strings } = useContext(LanguageContext);
    const { themeName, setThemeName, theme } = useContext(ThemeContext);
    
    return (
        <View style={[ styles.container, { backgroundColor: theme.background }]}>
            
            <View style={styles.userContainer}>
                <ThemedText type="titleBig">🙍‍♂️</ThemedText>
                <ThemedText type="titleMid" style={{ color: theme.highContrast, fontSize: 24 }}>
                    NAZWA UŻYTKOWNIKA
                </ThemedText>
                <ThemedText type="subtitle" style={{ color: theme.midContrast }}>
                    SESJA AKTYWNA
                </ThemedText>
            </View>

            <View style={styles.contextPickers}>
                <View style={styles.pickerContainer}>    
                    <View style={styles.rowTitle}>        
                        <ThemedText type="default" >
                            🗣️
                        </ThemedText>  
                        <ThemedText type="default" style={[styles.label, { color: theme.midContrast }]}>
                            {strings.profile_choose_language}
                        </ThemedText>
                    </View>
                    
                    <View style={styles.row}>
                        <TouchableOpacity style={[styles.picker, {backgroundColor: lang === 'pl' ? theme.highContrast : theme.background }]} onPress={() => setLang('pl')}>
                            <ThemedText type="titleSmall" style={{ color: lang === 'pl' ? theme.accentDark : theme.highContrast }}>
                                {strings.profile_polish}
                            </ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.picker, {backgroundColor: lang === 'en' ? theme.highContrast : theme.background }]} onPress={() => setLang('en')}>
                            <ThemedText type="titleSmall" style={{ color: lang === 'en' ? theme.accentDark : theme.highContrast }}>
                                {strings.profile_english}
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.pickerContainer}>
                    <View style={styles.rowTitle}>        
                        <ThemedText type="default" >
                            🔲
                        </ThemedText>  
                        <ThemedText type="default" style={[styles.label, { color: theme.midContrast }]}>
                            {strings.profile_choose_theme}
                        </ThemedText>
                    </View>

                    <View style={styles.row}>
                        <TouchableOpacity style={[styles.picker, {backgroundColor: themeName === 'light' ? theme.highContrast : theme.background }]} onPress={() => setThemeName('light')}>
                            <ThemedText  type="titleSmall" style={{ color: themeName === 'light' ? theme.accentDark : theme.highContrast }}>
                                {strings.profile_light_theme}
                            </ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.picker, {backgroundColor: themeName === 'dark' ? theme.highContrast : theme.background }]} onPress={() => setThemeName('dark')}>
                            <ThemedText type="titleSmall" style={{ color: themeName === 'dark' ? theme.accentDark : theme.highContrast }}>
                                {strings.profile_dark_theme}
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>    
            </View>

            <TouchableOpacity style={[styles.button, { borderColor: theme.midContrast}]} onPress={() => router.push('/auth/login')}>
                <ThemedText type="default" style={{ color: theme.midContrast}}>
                    {strings.profile_log_out}
                </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.smallButton}>
                <ThemedText type="textSmall" style={{color: theme.midContrast}}>
                    {strings.profile_delete_account}
                </ThemedText>
            </TouchableOpacity>
        </View>
    );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 20,
  },
  userContainer: {
    marginBottom: '20%',
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
    justifyContent: 'center',
    alignItems: 'center', 
    width: '80%',
    gap: 6,
  },
  rowTitle: {
    flexDirection: 'row', 
    justifyContent: 'center',
    alignItems: 'center', 
    width: '80%',
    gap: 6,
  },
  contextPickers: {
    gap: '6%',
  },
  pickerContainer: {
    width: '100%',
    gap: '2%',
  },
  picker: { 
    flex: 1, 
    paddingVertical: 10, 
    paddingHorizontal: 0,
    margin: 6, 
    borderRadius: 24, 
    alignItems: 'center' 
  },
  button: { 
    marginTop: '16%', 
    marginBottom: '16%',
    paddingVertical: 12,
    paddingHorizontal: 20, 
    borderRadius: 40, 
    alignItems: 'center',
    borderWidth: 3,
  },
  smallButton: {
    marginBottom: '6%',
  }
});
