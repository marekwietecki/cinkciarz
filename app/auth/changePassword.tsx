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

export default function ChangePasswordScreen() {
    const router = useRouter();
    const { strings } = useContext(LanguageContext);
    const { theme } = useContext(ThemeContext);

    const [newPassword, setNewPassword] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' | null}>({ text: '', type: null});

    const getAuthToken = async () => {
        return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    };

    const handleDelete = async () => {
        setMessage({ text: '', type: null });    

        if(!oldPassword || !newPassword) {
            setMessage({ text: strings.changePassword_fields_required, type: 'error' });
            return;
        }

        setLoading(true);

        const token = await getAuthToken();

        if (!token) {
            setMessage({ text: strings.changePassword_error_auth, type: 'error' });
            router.replace('/auth/login');
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/auth/change-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, 
                },
                body: JSON.stringify({ oldPassword, newPassword }), 
            });

            const data = await response.json();

            if (response.ok) {
                await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
                await AsyncStorage.removeItem(AVATAR_KEY);
                router.replace({
                    pathname: '/auth/login',
                    params: { changed: 'true' }
                })
            } else {
                setMessage(data.message || strings.delete_unknown_error);
            }
        } catch (error) {
            console.error("Błąd usunięcia konta:", error);
            setMessage({ text: strings.changePassword_network_error, type: 'error' });
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <KeyboardAvoidingView 
            style={{ flex: 1, backgroundColor: theme.background }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={[ styles.container, { backgroundColor: theme.background, flexGrow: 1 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.back}>
                    <ChevronLeftIcon color={theme.highContrast} size={30}></ChevronLeftIcon>
                </TouchableOpacity>

                <View style={styles.titleContainer}>
                    <ThemedText type="titleMid" style={{color: theme.failure}}>
                        {strings.changePassword_title}
                    </ThemedText>
                    <ThemedText type="subtitle" style={{color: theme.midContrast}}>
                        {strings.changePassword_warning}
                    </ThemedText>
                </View>

                <View style={styles.inputsContainer}>
                    <TextInput 
                        placeholder={strings.changePassword_oldPassword} 
                        placeholderTextColor={theme.lowContrast}
                        style={[styles.textInput, { color: theme.highContrast, borderColor: theme.lowContrast }]}
                        onChangeText={setOldPassword}
                        value={oldPassword}
                        secureTextEntry={true}
                        editable={!loading}
                    />
                    <TextInput 
                        placeholder={strings.changePassword_newPassword} 
                        placeholderTextColor={theme.lowContrast}
                        style={[styles.textInput, { color: theme.highContrast, borderColor: theme.lowContrast }]}
                        onChangeText={setNewPassword}
                        value={newPassword}
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
                        {loading ? strings.changePassword_loading : strings.changePassword_button}
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
        paddingVertical: 12,
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