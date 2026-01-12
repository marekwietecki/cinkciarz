import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ChevronLeftIcon } from '@/components/Icons';
import { ThemedText } from '@/components/themed-text';
import { AuthContext } from '@/contexts/authContext';
import { LanguageContext } from '../../contexts/languageContext';
import { ThemeContext } from '../../contexts/themeContext';
import { Fonts } from '../_layout';
import { useNetInfo } from '@react-native-community/netinfo';


import { AVATAR_KEY, BASE_API_URL } from '@/config';


export default function DeleteAccountScreen() {
    const router = useRouter();
    const { strings } = useContext(LanguageContext);
    const { theme } = useContext(ThemeContext);
    const { token, logout } = useContext(AuthContext);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' | null}>({ text: '', type: null});
    const netInfo = useNetInfo();
    const isOffline = netInfo.isConnected === false; 


    const handleDelete = async () => {
        setMessage({ text: '', type: null });    

        if(!email || !password) {
            setMessage({ text: strings.delete_fields_required, type: 'error' });
            return;
        }

        setLoading(true);

        if (!token) {
            setMessage({ text: strings.delete_error_auth, type: 'error' });
            router.replace('/(auth)/login');
            return;
        }

        try {
            const response = await fetch(`${BASE_API_URL}/auth/delete`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, 
                },
                body: JSON.stringify({ email, password }), 
            });

            const data = await response.json();

            if (response.ok) {
                logout();
                await AsyncStorage.removeItem(AVATAR_KEY);
                router.replace ({
                    pathname: '/(auth)/register',
                    params: { deleted: 'true' }
                })
            } else {
                setMessage({ text: strings.delete_unknown_error, type: 'error' });
            }
        } catch (error) {
            console.error("Błąd usunięcia konta:", error);
            setMessage({ text: strings.delete_network_error, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (netInfo.isConnected === false) {
          setMessage({ 
            text: strings.transaction_offline_error, 
            type: 'error' 
          });
        } else if (netInfo.isConnected === true) {
          console.log("Internet wrócił!");
          
          if (message.text === strings.transaction_offline_error) {
            setMessage({ text: '', type: null });
          }
          
        }
      }, [netInfo.isConnected, strings.transaction_offline_error]);

    return (
        <KeyboardAvoidingView 
            style={[ styles.kav, { backgroundColor: theme.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >

            <TouchableOpacity onPress={() => router.back()} style={styles.back}>
                <ChevronLeftIcon color={theme.highContrast} size={30}></ChevronLeftIcon>
            </TouchableOpacity>

            {isOffline && (
                <View style={styles.offlineWrapper}>
                    <ThemedText style={[styles.offlineText, { color: theme.lowContrast }]}>
                        {strings.no_internet_connection}
                    </ThemedText>
                    <ThemedText style={[styles.offlineText, { color: theme.lowContrast }]}>
                        {strings.no_internet_connection_disclaimer}
                    </ThemedText>
                </View>
            )}

            <View style={[ styles.container, { backgroundColor: theme.background }]}>
                <View style={styles.titleContainer}>
                    <ThemedText type="titleMid" style={{color: theme.highContrast}}>
                        {strings.delete_title}
                    </ThemedText>
                    <ThemedText type="subtitle" style={{color: theme.midContrast, maxWidth: 300}}>
                        {strings.delete_warning}
                    </ThemedText>
                </View>

                <View style={styles.inputsContainer}>
                    <TextInput 
                        placeholder={strings.delete_email} 
                        placeholderTextColor={theme.lowContrast}
                        style={[styles.textInput, { color: theme.highContrast, borderColor: theme.lowContrast }]}
                        onChangeText={setEmail}
                        value={email}
                        keyboardType='email-address'
                        autoCapitalize='none'
                        editable={!loading && !isOffline}
                    />
                    <TextInput 
                        placeholder={strings.delete_password} 
                        placeholderTextColor={theme.lowContrast}
                        style={[styles.textInput, { color: theme.highContrast, borderColor: theme.lowContrast }]}
                        onChangeText={setPassword}
                        value={password}
                        secureTextEntry={true}
                        editable={loading && isOffline}
                    />
                </View>

                {message.type && message.text ? (
                    <View style={ styles.messageContainer }>
                    <ThemedText 
                        type="default"
                        style={[styles.message, {color: message.type === 'error' ? theme.failure : theme.success}]} 
                    >
                        {message.text}  
                    </ThemedText>  
                    </View>
                ) : null}

                <TouchableOpacity 
                    style={[styles.button, { backgroundColor: theme.failure, opacity: (loading || isOffline) ? 0.2 : 1 }]}
                    onPress={handleDelete}
                    disabled={loading || isOffline}            
                >
                    <ThemedText type='default' style={{ color: theme.highContrast }}>
                        {loading ? strings.delete_loading : strings.delete_button}
                    </ThemedText>
                </TouchableOpacity>
                
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    kav: {
        flex: 1, 
        width: '100%',  
        alignItems: 'center', 
        overflow: 'hidden'
    },
    container: { 
        padding: 20, 
        justifyContent: 'center', 
        alignItems: 'center',
        alignSelf: 'center',
        flex: 1,
        width: '100%',
        maxWidth: 480, 
    },
    offlineWrapper: {
        position: 'absolute',
        top: 70,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
        maxWidth: 200,
    },
    offlineText: {
        fontSize: 12,
        fontFamily: Fonts.bold,
        textAlign: 'center',
    },
    titleContainer: { 
        marginBottom: 24, 
        alignItems: 'center',
        width: '96%', 
        gap: 6,
    },
    inputsContainer: { 
        width: '100%', 
        maxWidth: 300,
        marginBottom: 20, 
        gap: 15 
    },
    textInput: {
        fontFamily: Fonts.regular, 
        fontSize: 16, 
        lineHeight: 20,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderWidth: 2,
        borderRadius: 32,
      },
    button: {
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    back: {
        position: 'absolute', 
        top: '8%', 
        left: '4%',
        zIndex: 10,
    },
    messageContainer: {
        marginVertical: 10,
        marginBottom: 20, 
        paddingHorizontal: 20
    },
    message: {
        textAlign: 'center',
    },
});