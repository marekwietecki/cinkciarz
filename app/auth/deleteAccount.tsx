import { useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Alert, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

import { LanguageContext } from '../../contexts/languageContext';
import { ThemeContext } from '../../contexts/themeContext';
import { ThemedText } from '@/components/themed-text';
import { Fonts } from '../_layout';
import { ChevronLeftIcon } from '@/components/Icons';

const BASE_URL = 'http://192.168.18.9:4000/api';
const AUTH_TOKEN_KEY = 'userToken'; 
const AVATAR_KEY = '@user_avatar';

export default function DeleteAccountScreen() {
    const router = useRouter();
    const { strings } = useContext(LanguageContext);
    const { theme } = useContext(ThemeContext);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const getAuthToken = async () => {
        return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    };

    const handleDelete = async () => {
        setMessage('');

        if(!email || !password) {
            setMessage(strings.delete_fields_required)
            return;
        }

        setLoading(true);

        const token = await getAuthToken();

        if (!token) {
            Alert.alert(strings.error, strings.delete_error_auth);
            router.replace('/auth/login');
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/auth/delete`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, 
                },
                body: JSON.stringify({ email, password }), 
            });

            const data = await response.json();

            if (response.ok) {
                await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
                await AsyncStorage.removeItem(AVATAR_KEY);
                Alert.alert(strings.success, strings.delete_success);
                router.replace('/auth/login');
            } else {
                setMessage(data.message || strings.delete_unknown_error);
            }
        } catch (error) {
            console.error("Błąd usunięcia konta:", error);
            setMessage(strings.delete_network_error);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <KeyboardAvoidingView 
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={[ styles.container, { backgroundColor: theme.background, flexGrow: 1 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.back}>
                    <ChevronLeftIcon color={theme.highContrast} size={30}></ChevronLeftIcon>
                </TouchableOpacity>

                <View style={styles.titleContainer}>
                    <ThemedText type="titleMid" style={{color: theme.failure}}>
                        {strings.delete_title}
                    </ThemedText>
                    <ThemedText type="subtitle" style={{color: theme.midContrast}}>
                        {strings.delete_warning}
                    </ThemedText>
                </View>

                <View style={styles.inputsContainer}>
                    <TextInput 
                        placeholder={strings.login_email} 
                        placeholderTextColor={theme.lowContrast}
                        style={[styles.textInput, { color: theme.highContrast, borderColor: theme.lowContrast }]}
                        onChangeText={setEmail}
                        value={email}
                        keyboardType='email-address'
                        autoCapitalize='none'
                        editable={!loading}
                    />
                    <TextInput 
                        placeholder={strings.login_password} 
                        placeholderTextColor={theme.lowContrast}
                        style={[styles.textInput, { color: theme.highContrast, borderColor: theme.lowContrast }]}
                        onChangeText={setPassword}
                        value={password}
                        secureTextEntry={true}
                        editable={!loading}
                    />
                </View>

                {message ? (
                    <ThemedText style={{ color: theme.failure, marginBottom: 15 }}>{message}</ThemedText>
                ) : null}

                <TouchableOpacity 
                    style={[styles.button, { backgroundColor: theme.failure }]}
                    onPress={handleDelete}
                    disabled={loading}
                >
                    <ThemedText type='default' style={{ color: theme.background }}>
                        {loading ? strings.delete_loading : strings.delete_button}
                    </ThemedText>
                </TouchableOpacity>
                
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { 
        padding: 20, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    titleContainer: { 
        marginBottom: 40, 
        alignItems: 'center',
        width: '96%', 
        gap: 6,
    },
    inputsContainer: { 
        width: '100%', 
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
    },
});