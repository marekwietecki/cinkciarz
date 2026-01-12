import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ChevronLeftIcon } from '@/components/Icons';
import { ThemedText } from '@/components/themed-text';
import { AuthContext } from '@/contexts/authContext';
import { LanguageContext } from '../../contexts/languageContext';
import { ThemeContext } from '../../contexts/themeContext';
import { Fonts } from '../_layout';

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

    return (
        <KeyboardAvoidingView 
            style={[ styles.kav, { backgroundColor: theme.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >

            <TouchableOpacity onPress={() => router.back()} style={styles.back}>
                <ChevronLeftIcon color={theme.highContrast} size={30}></ChevronLeftIcon>
            </TouchableOpacity>

            <View style={[ styles.container, { backgroundColor: theme.background }]}>
                <View style={styles.titleContainer}>
                    <ThemedText type="titleMid" style={{color: theme.failure}}>
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
                        editable={!loading}
                    />
                    <TextInput 
                        placeholder={strings.delete_password} 
                        placeholderTextColor={theme.lowContrast}
                        style={[styles.textInput, { color: theme.highContrast, borderColor: theme.lowContrast }]}
                        onChangeText={setPassword}
                        value={password}
                        secureTextEntry={true}
                        editable={!loading}
                    />
                </View>

                <TouchableOpacity 
                    style={[styles.button, { backgroundColor: theme.failure }]}
                    onPress={handleDelete}
                    disabled={loading}
                >
                    <ThemedText type='default' style={{ color: theme.background }}>
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
    titleContainer: { 
        marginBottom: 40, 
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
});