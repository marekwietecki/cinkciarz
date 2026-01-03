import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Collapsible } from '@/components/collapsible';
import { ThemedText } from '@/components/themed-text';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChevronLeftIcon, ContrastIcon, LanguagesIcon, UserIcon } from '../components/Icons';
import { LanguageContext } from '../contexts/languageContext';
import { ThemeContext } from '../contexts/themeContext';

import { AUTH_TOKEN_KEY, BASE_API_URL } from '@/config';

const AVATAR_KEY = 'userAvatar';

export default function ProfileScreen() {
    const router = useRouter();
    const { lang, setLang, strings } = useContext(LanguageContext);
    const { themeName, setThemeName, theme } = useContext(ThemeContext);
    const [ avatar, setAvatar ] = useState('');
    const [ isLoggedIn, setIsLoggedIn ] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    
    const fetchUserProfile = async () => {
    try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) return;

        const response = await fetch(`${BASE_API_URL}/auth/me`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
        });

        if (response.ok) {
        const userData = await response.json();
        console.log("CO PRZYSZŁO Z BACKENDU:", userData); 
        setUserEmail(userData.email || 'Brak maila w tokenie');
        } else {
        console.warn("Serwer odpowiedział błędem:", response.status);
        }
    } catch (error) {
        console.error("Błąd pobierania profilu:", error);
    }
    };

    useFocusEffect(
        useCallback(() => {
            fetchUserProfile();
        }, [])
    );

    useEffect(() => {
        const loadProfileData = async () => {
            try {
                const storedToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
                if (storedToken) {
                    setIsLoggedIn(true); 
                }
                
                const storedAvatar = await AsyncStorage.getItem(AVATAR_KEY);
                if (storedAvatar) {
                    setAvatar(storedAvatar);
                }
            } catch (e) {
                console.error('Błąd ładowania danych profilu:', e);
            }
        }
        loadProfileData();
    }, []);

    useEffect(() => {
        const loadAvatar = async () => {
            try {
                const storedAvatar = await AsyncStorage.getItem(AVATAR_KEY);
                if (storedAvatar) {
                    setAvatar(storedAvatar);
                }
            } catch (e) {
                console.error('Błąd ładowania avatara:', e);
            }
        }
        loadAvatar();
    }, []);

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem(AUTH_TOKEN_KEY);

            router.replace('/auth/login'); 
            
            console.log('Użytkownik wylogowany pomyślnie.');
        } catch (e) {
            console.error('Błąd podczas wylogowywania:', e);
            router.replace('/auth/login'); 
        }
    };


    const handleSetAvatar = useCallback(async (newAvatar: string) => {
        try {
            await AsyncStorage.setItem(AVATAR_KEY, newAvatar);
            setAvatar(newAvatar);
        } catch (e) {
            console.error('Błąd zapisu avatara:', e);
        }
    }, [setAvatar]);

    const handleGoBack = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/'); 
            console.warn("Nie można się cofnąć, stos nawigacji jest pusty - przeniesiono do ekranu początkowego.");
        }
    };

    return (
        <View style={[ styles.container, { backgroundColor: theme.background }]}>
            <TouchableOpacity onPress={handleGoBack} style={styles.back}>
                <ChevronLeftIcon color={theme.highContrast} size={30}></ChevronLeftIcon>
            </TouchableOpacity>
            

            <View style={styles.userContainer}>
                {avatar === '' ? (
                    <UserIcon size={32} color={theme.highContrast} strokeWidth={3.5} />
                ) : (
                    <ThemedText type="titleBig">{avatar}</ThemedText>
                )}
                <ThemedText type="titleSmall" style={{ color: theme.highContrast, fontSize: 18 }}>
                    {userEmail}
                </ThemedText>
                <ThemedText type="subtitle" style={{ color: theme.midContrast }}>
                {isLoggedIn 
                    ? strings.profile_logged_in        
                    : strings.profile_not_logged_in     
                }                    
                </ThemedText>

            </View>

            

            <View style={styles.contextPickers}>
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
                            onPress={() => handleSetAvatar('👨🏻')}
                        >
                            <Text style={{ color: avatar === '👨🏻' ? theme.accentDark : theme.highContrast, fontSize: 20 }}>
                                👨🏻
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.picker, {borderColor: theme.highContrast, borderBottomWidth: avatar === '👩🏻' ? 3 : 0, }]} 
                            onPress={() => handleSetAvatar('👩🏻')}
                        >
                            <Text style={{ color: avatar === '👨🏻' ? theme.accentDark : theme.highContrast, fontSize: 20 }}>
                                👩🏻
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.picker, {borderColor: theme.highContrast, borderBottomWidth: avatar === '👱🏻‍♀️' ? 3 : 0, }]} 
                            onPress={() => handleSetAvatar('👱🏻‍♀️')}
                        >
                            <Text 
                                style={{ color: avatar === '👱🏻‍♀️' ? theme.accentDark : theme.highContrast, fontSize: 20 }}
                            >
                                👱🏻‍♀️
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.picker, {borderColor: theme.highContrast, borderBottomWidth: avatar === '👱🏻‍♂️' ? 3 : 0,  }]} 
                            onPress={() => handleSetAvatar('👱🏻‍♂️')}
                        >
                            <Text 
                                style={{ color: avatar === '👱🏻‍♂️' ? theme.accentDark : theme.highContrast, fontSize: 20 }}
                            >
                                👱🏻‍♂️
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.picker, {borderColor: theme.highContrast, borderBottomWidth: avatar === '👨🏻‍🦲' ? 3 : 0,  }]} 
                            onPress={() => handleSetAvatar('👨🏻‍🦲')}
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
                <View style={styles.pickerContainer}>
                    <Collapsible title={strings.profile_account_settings}>
                        <TouchableOpacity onPress={() => router.push('./auth/changePassword')}>
                            <ThemedText type="titleSmall" style={{color: theme.highContrast}}>
                                {strings.profile_change_password}
                            </ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => router.push('./auth/deleteAccount')}>
                            <ThemedText type="titleSmall" style={{color: theme.highContrast}}>
                                {strings.profile_delete_account}
                            </ThemedText>
                        </TouchableOpacity>
                    </Collapsible> 
                </View>
            </View>

            <TouchableOpacity style={[styles.button, { borderColor: theme.midContrast}]} onPress={handleLogout}>
                <ThemedText type="default" style={{ color: theme.midContrast}}>
                    {strings.profile_log_out}
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
  back: {
    position: 'absolute', 
    top: '8%', 
    left: '4%',
  },
  userContainer: {
    marginBottom: '16%',
    alignSelf: 'flex-start',
    marginLeft: '8%',
    gap: 2,
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
    gap: 40,
  },
  pickerContainer: {
    width: '100%',
    alignSelf: 'center'
  },
  picker: { 
    flex: 1, 
    paddingVertical: 8, 
    margin: 6,
    alignItems: 'center' 
  },
  button: {
    marginBottom: '8%',
    marginTop: '16%',
    paddingVertical: 12,
    paddingHorizontal: 20, 
    borderRadius: 40, 
    alignItems: 'center',
    borderWidth: 3,
  },
});
