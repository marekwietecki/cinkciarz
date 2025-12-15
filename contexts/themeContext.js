import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dark from '../themes/dark';
import light from '../themes/light';

const THEME_KEY = '@app_theme';

export const ThemeContext = createContext({
    themeName: 'light',
    setThemeName: (newThemeName) => {},
    theme: light
});

export const ThemeProvider = ({children}) => {
    const [themeName, _setThemeName] = useState ('light');
    
    const setThemeName = useCallback(async (newThemeName) => {
        try {
            await AsyncStorage.setItem(THEME_KEY, newThemeName);
            _setThemeName(newThemeName);
        } catch (e) {
            console.error('Błąd zapisu motywu', e);
        }
    }, []);

    useEffect(() => {
        const loadTheme = async () => {
            try {
                const storedTheme = await AsyncStorage.getItem(THEME_KEY);
                _setThemeName(storedTheme || 'dark');
            } catch (e) {
                console.error('Błąd ładowania motywu:', e);
                _setThemeName('dark');
            }
        }
        loadTheme();
    }, []);

    const theme = useMemo(() => (themeName === 'dark' ? dark : light), [themeName]);

    if (themeName === null) {
        return null; 
    }

    return (
        <ThemeContext.Provider value={{ themeName, setThemeName, theme}}>
            {children}
        </ThemeContext.Provider>
    );
};