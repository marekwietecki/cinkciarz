import React, {createContext, useState, useMemo, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from '../locales/en.json';
import pl from '../locales/pl.json';

const LANGUAGE_KEY = '@app_language';

export const LanguageContext = createContext({
    lang: 'en',
    setLang: (newLangName) => {},
    strings: en
});

export const LanguageProvider = ({ children }) => {
    const [lang, _setLang] = useState(null);

    const setLang = useCallback(async (newLang) => {
        try {
            await AsyncStorage.setItem(LANGUAGE_KEY, newLang);
            _setLang(newLang);
        } catch (e) {
            console.error('Błąd zapisu języka:', e);
        }
    }, []);

    useEffect(() => {
        const loadLang = async () => {
            try {
                const storedLang = await AsyncStorage.getItem(LANGUAGE_KEY);
                _setLang(storedLang || 'en');
            } catch (e) {
                console.error('Błąd ładowania języka:', e);
                _setLang('en');
            }
        }
        loadLang();
    }, []);

    const strings = useMemo(() => (lang === 'pl' ? pl : en), [lang]);

    if (lang === null) {
        return null;
    }

    return (
        <LanguageContext.Provider value={{ lang, setLang, strings }}>
            {children}
        </LanguageContext.Provider>
    )
}