import { Tabs } from 'expo-router';
import React, { useContext } from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemeContext } from '@/contexts/themeContext';
import { LanguageContext } from '@/contexts/languageContext';
import { WalletIcon, RatesIcon, TransationIcon, HistoryIcon } from '../../components/Icons'

export default function TabLayout() {
  const { theme } = useContext(ThemeContext);
  const { strings } = useContext(LanguageContext);
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.highContrast,
        tabBarInactiveTintColor: theme.lowContrast,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.lowContrast,
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="house.fill" color={ color } />,
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: strings.nav_wallet,
          tabBarIcon: ({ color }) => <WalletIcon size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="rates"
        options={{
          title: strings.nav_rates,
          tabBarIcon: ({ color }) => <RatesIcon size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="transaction"
        options={{
          title: strings.nav_transaction,
          tabBarIcon: ({ color }) => <TransationIcon size={24}  color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: strings.nav_history,
          tabBarIcon: ({ color }) => <HistoryIcon size={24}  color={color} />,
        }}
      />
    </Tabs>
  );
}
