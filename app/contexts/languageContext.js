import React, {createContext, useState, useMemo } from 'react';
import en from '../locales/en.json';
import pl from '../locales/pl.json';

export const LanguageContext = createContext({
    lang: 'en',
    setLang: () => {},
    strings: en
});

export const LanguageProvider = ({ children }) => {
    const [lang, setLang] = useState('en');

    const strings = useMemo(() => (lang === 'pl' ? pl : en), [lang]);

    return (
        <LanguageContext.Provider value={{ lang, setLang, strings }}>
            {children}
        </LanguageContext.Provider>
    )
}