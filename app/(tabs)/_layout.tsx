import { Tabs, useRouter } from 'expo-router';
import React, { useContext, useEffect } from 'react';
import { Text } from 'react-native'; 

import { HapticTab } from '@/components/haptic-tab';
import { ThemeContext } from '../../contexts/themeContext';
import { LanguageContext } from '../../contexts/languageContext';
import { WalletIcon, RatesIcon, TopUpIcon, TransationIcon, HistoryIcon } from '../../components/Icons'
import { AuthContext } from '../../contexts/authContext';

export default function TabLayout() {
  const { theme } = useContext(ThemeContext);
  const { strings } = useContext(LanguageContext);
  
  const { token, isLoading } = useContext(AuthContext);
  const router = useRouter();
  
  useEffect(() => {
    if (!isLoading && !token) {
      router.replace('/(auth)/login');
    }
  }, [isLoading, token, router]);

  if (isLoading) return null;
  
  const TabLabel = ({ label, focused, color }: { label: string; focused: boolean; color: string }) => (
    <Text 
      style={{ 
        color, 
        fontSize: 10, 
        fontWeight: focused ? '800' : '400', 
        marginTop: -1, 
        marginBottom: 2 
      }}
    >
      {label}
    </Text>
  );

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
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: strings.nav_wallet,
          tabBarIcon: ({ color }) => <WalletIcon size={22} color={color} />,
          tabBarLabel: ({ color, focused }) => (
            <TabLabel label={strings.nav_wallet} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="rates"
        options={{
          title: strings.nav_rates,
          tabBarIcon: ({ color }) => <RatesIcon size={22} color={color} />,
          tabBarLabel: ({ color, focused }) => (
            <TabLabel label={strings.nav_rates} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="topup"
        options={{
          title: strings.nav_topup,
          tabBarIcon: ({ color }) => <TopUpIcon size={22} color={color} />,
          tabBarLabel: ({ color, focused }) => (
            <TabLabel label={strings.nav_topup} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="transaction"
        options={{
          title: strings.nav_transaction,
          tabBarIcon: ({ color }) => <TransationIcon size={22}  color={color} />,
          tabBarLabel: ({ color, focused }) => (
            <TabLabel label={strings.nav_transaction} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: strings.nav_history,
          tabBarIcon: ({ color }) => <HistoryIcon size={22}  color={color} />,
          tabBarLabel: ({ color, focused }) => (
            <TabLabel label={strings.nav_history} color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
