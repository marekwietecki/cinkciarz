import React, {createContext, useState, useMemo } from 'react';
import light from '../themes/light';
import dark from '../themes/dark';

export const ThemeContext = createContext({
    themeName: 'light',
    setThemeName: (p0: string) => {},
    theme: light
});

export const ThemeProvider = ({children}) => {
    const [themeName, setThemeName] = useState ('light');
    
    const theme = useMemo(() => (themeName === 'dark' ? dark : light), [themeName]);

    return (
        <ThemeContext.Provider value={{ themeName, setThemeName, theme}}>
            {children}
        </ThemeContext.Provider>
    );
};