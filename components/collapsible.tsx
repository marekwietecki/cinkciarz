import { ThemeContext } from '@/contexts/themeContext';
import React, { PropsWithChildren, useContext, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ChevronRightIcon } from './Icons';
import { ThemedText } from './themed-text';


export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useContext(ThemeContext);

  return (
    <View>
      <TouchableOpacity
        style={styles.heading}
        onPress={() => setIsOpen((value) => !value)}
        activeOpacity={0.8}
      >
        
        <ChevronRightIcon size={16} color={theme.midContrast} style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }}></ChevronRightIcon>

        <ThemedText 
          type="default"  
          style={{
            fontSize: 16, 
            marginTop:2, 
            marginBottom: 2,
            color: theme.midContrast
          }}
        >

            {title}
        </ThemedText>

      </TouchableOpacity>
      {isOpen && <View style={styles.content}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center'
  },
  picker: { 
    flex: 1, 
    paddingVertical: 10, 
    paddingHorizontal: 0,
    margin: 6,
    alignItems: 'center' 
  },
  content: {
    marginTop: 12,
    gap: 40,
    flexDirection: 'row',
  },
});
