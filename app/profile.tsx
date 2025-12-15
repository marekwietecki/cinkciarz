import { useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';

import { LanguageContext } from '../contexts/languageContext';
import { ThemeContext } from '../contexts/themeContext';
import { ThemedText } from '@/components/themed-text';
import { UserIcon, LanguagesIcon, ContrastIcon } from '../components/Icons';



export default function WelcomeScreen() {
    const router = useRouter();
    const { lang, setLang, strings } = useContext(LanguageContext);
    const { themeName, setThemeName, theme } = useContext(ThemeContext);
    const [ avatar, setAvatar ] = useState('');
    
    return (
        <View style={[ styles.container, { backgroundColor: theme.background }]}>
            
            <View style={styles.userContainer}>
                <ThemedText type="titleBig">{avatar}</ThemedText>
                if{ avatar === '' &&(<UserIcon size={32} color={theme.highContrast} strokeWidth={3.5}/>)}
                <ThemedText type="titleMid" style={{ color: theme.highContrast, fontSize: 24 }}>
                    NAZWA UŻYTKOWNIKA
                </ThemedText>
                <ThemedText type="subtitle" style={{ color: theme.midContrast }}>
                    Zalogowany {/* ?? */}
                </ThemedText> 
            </View>

            <View style={styles.contextPickers}>
                
                {/* Dodać wybieranie awatara */}
                <View style={styles.pickerContainer}>
                    <View style={styles.rowTitle}>         
                        {/*👨🏻👩🏻👨🏻‍🦲👱🏻‍♀️👱🏻*/}
                        <UserIcon size={16} color={theme.midContrast} strokeWidth={3.5}/>
                        <ThemedText type="default" style={[styles.label, { color: theme.midContrast }]}>
                            {strings.profile_choose_avatar}
                        </ThemedText>
                    </View>

                    <View style={styles.row}>
                        <TouchableOpacity 
                            style={[styles.picker, {borderColor: theme.highContrast, borderBottomWidth: avatar === '👨🏻' ? 3 : 0, }]} 
                            onPress={() => setAvatar('👨🏻')}
                        >
                            <Text style={{ color: avatar === '👨🏻' ? theme.accentDark : theme.highContrast, fontSize: 20 }}>
                                👨🏻
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.picker, {borderColor: theme.highContrast, borderBottomWidth: avatar === '👩🏻' ? 3 : 0, }]} 
                            onPress={() => setAvatar('👩🏻')}
                        >
                            <Text style={{ color: avatar === '👨🏻' ? theme.accentDark : theme.highContrast, fontSize: 20 }}>
                                👩🏻
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.picker, {borderColor: theme.highContrast, borderBottomWidth: avatar === '👱🏻‍♀️' ? 3 : 0, }]} 
                            onPress={() => setAvatar('👱🏻‍♀️')}
                        >
                            <Text 
                                style={{ color: avatar === '👱🏻‍♀️' ? theme.accentDark : theme.highContrast, fontSize: 20 }}
                            >
                                👱🏻‍♀️
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.picker, {borderColor: theme.highContrast, borderBottomWidth: avatar === '👱🏻‍♂️' ? 3 : 0,  }]} 
                            onPress={() => setAvatar('👱🏻‍♂️')}
                        >
                            <Text 
                                style={{ color: avatar === '👱🏻‍♂️' ? theme.accentDark : theme.highContrast, fontSize: 20 }}
                            >
                                👱🏻‍♂️
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.picker, {borderColor: theme.highContrast, borderBottomWidth: avatar === '👨🏻‍🦲' ? 3 : 0,  }]} 
                            onPress={() => setAvatar('👨🏻‍🦲')}
                        >
                            <Text 
                                style={{ color: avatar === '👨🏻‍🦲' ? theme.accentDark : theme.highContrast, fontSize: 20 }}
                            >
                                👨🏻‍🦲
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
                
                <View style={styles.pickerContainer}>    
                    <View style={styles.rowTitle}>        
                        <LanguagesIcon size={16} color={theme.midContrast} strokeWidth={3.2}/>
                        <ThemedText type="default" style={[styles.label, { color: theme.midContrast }]}>
                            {strings.profile_choose_language}
                        </ThemedText>
                    </View>
                    
                    <View style={styles.row}>
                        <TouchableOpacity style={[styles.picker, {borderColor: lang === 'pl' ? theme.accentDark : theme.background }]} onPress={() => setLang('pl')}>
                            <ThemedText type="titleSmall" style={{ color: theme.highContrast, borderBottomWidth: lang === 'pl' ? 3 : 0, borderColor: theme.highContrast }}>
                                {strings.profile_polish}
                            </ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.picker, {borderColor: lang === 'en' ? theme.accentDark : theme.background }]} onPress={() => setLang('en')}>
                            <ThemedText type="titleSmall" style={{ color: theme.highContrast, borderBottomWidth: lang === 'en' ? 3 : 0, borderColor: theme.highContrast }}>
                                {strings.profile_english}
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.pickerContainer}>
                    <View style={styles.rowTitle}>        
                        <ContrastIcon size={16} color={theme.midContrast} strokeWidth={3.5}/>  
                        <ThemedText type="default" style={[styles.label, { color: theme.midContrast }]}>
                            {strings.profile_choose_theme}
                        </ThemedText>
                    </View>

                    <View style={styles.row}>
                        <TouchableOpacity style={[styles.picker, {borderColor: themeName === 'light' ? theme.accentDark : theme.background }]} onPress={() => setThemeName('light')}>
                            <ThemedText  type="titleSmall" style={{ color: theme.highContrast, borderBottomWidth: themeName === 'light' ? 3 : 0, borderColor: theme.highContrast }}>
                                {strings.profile_light_theme}
                            </ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.picker, {borderColor: themeName === 'dark' ? theme.accentDark : theme.background }]} onPress={() => setThemeName('dark')}>
                            <ThemedText type="titleSmall" style={{ color: theme.highContrast, borderBottomWidth: themeName === 'dark' ? 3 : 0, borderColor: theme.highContrast }}>
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
    marginTop:2, 
    marginBottom: 2,
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
    gap: '10%',
  },
  pickerContainer: {
    width: '100%',
  },
  picker: { 
    flex: 1, 
    paddingVertical: 10, 
    paddingHorizontal: 0,
    margin: 6,
    alignItems: 'center' 
  },
  button: {
    marginBottom: '6%',
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
