import React, { createContext, useMemo, useState } from 'react';
import dark from '../themes/dark';
import light from '../themes/light';

export const ThemeContext = createContext({
    themeName: 'light',
    setThemeName: () => {},
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