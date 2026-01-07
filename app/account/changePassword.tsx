import { useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Alert, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

import { LanguageContext } from '../../contexts/languageContext';
import { ThemeContext } from '../../contexts/themeContext';
import { ThemedText } from '@/components/themed-text';
import { Fonts } from '../_layout';
import { ChevronLeftIcon } from '@/components/Icons';
import { AuthContext } from '@/contexts/authContext';

import { BASE_API_URL, AVATAR_KEY } from '@/config';

export default function ChangePasswordScreen() {
    const router = useRouter();
    const { strings } = useContext(LanguageContext);
    const { theme } = useContext(ThemeContext);
    const { token } = useContext(AuthContext);
    

    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleChange = async () => {
        setMessage('');

        if(!oldPassword || !newPassword || !confirmNewPassword) {
            setMessage(strings.change_password_fields_required)
            return;
        }

        if(newPassword !== confirmNewPassword) {
            setMessage(strings.change_password_password_mismatch)
            return;
        }

        setLoading(true);

        if (!token) {
            Alert.alert(strings.error, strings.change_password_error_auth);
            router.replace('/(auth)/login');
            return;
        }

        try {
            const response = await fetch(`${BASE_API_URL}/auth/change-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, 
                },
                body: JSON.stringify({ oldPassword, newPassword }), 
            });

            const data = await response.json();

            if (response.ok) {
                
                try {
                    const response = await fetch(`${BASE_API_URL}/auth/me`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
    
                    if (response.ok) {
                        const userData = await response.json();
                        console.log("CO PRZYSZŁO Z BACKENDU:", userData);
                    } else {
                        console.warn("Serwer odpowiedział błędem:", response.status);
                    }
                } catch (error) {
                    console.error("Błąd pobierania profilu:", error);
                }

                setMessage(data.message || strings.change_password_success);


                await AsyncStorage.removeItem(AVATAR_KEY);
                Alert.alert(strings.success, strings.change_password_success);
                router.replace('/(auth)/login');
            } else {
                setMessage(data.message || strings.change_password_unknown_error);
            }
        } catch (error) {
            console.error("Błąd usunięcia konta:", error);
            setMessage(strings.change_password_network_error);
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
                        {strings.change_password_title}
                    </ThemedText>
                    <ThemedText type="subtitle" style={{color: theme.midContrast}}>
                        {strings.change_password_warning}
                    </ThemedText>
                </View>

                <View style={styles.inputsContainer}>
                    <TextInput 
                        placeholder={strings.change_password_current_password} 
                        placeholderTextColor={theme.lowContrast}
                        style={[styles.textInput, { color: theme.highContrast, borderColor: theme.lowContrast }]}
                        onChangeText={setOldPassword}
                        value={oldPassword}
                        autoCapitalize='none'
                        secureTextEntry={true}
                        editable={!loading}
                    />
                    <TextInput 
                        placeholder={strings.change_password_new_password} 
                        placeholderTextColor={theme.lowContrast}
                        style={[styles.textInput, { color: theme.highContrast, borderColor: theme.lowContrast }]}
                        onChangeText={setNewPassword}
                        value={newPassword}
                        autoCapitalize='none'
                        secureTextEntry={true}
                        editable={!loading}
                    />
                    <TextInput 
                        placeholder={strings.change_password_confirm_password} 
                        placeholderTextColor={theme.lowContrast}
                        style={[styles.textInput, { color: theme.highContrast, borderColor: theme.lowContrast }]}
                        onChangeText={setConfirmNewPassword}
                        value={confirmNewPassword}
                        autoCapitalize='none'
                        secureTextEntry={true}
                        editable={!loading}
                    />
                </View>

                {message ? (
                    <ThemedText style={{ color: theme.failure, marginBottom: 15 }}>{message}</ThemedText>
                ) : null}

                <TouchableOpacity 
                    style={[styles.button, { backgroundColor: theme.failure }]}
                    onPress={handleChange}
                    disabled={loading}
                >
                    <ThemedText type='default' style={{ color: theme.background }}>
                        {loading ? strings.change_password_loading : strings.change_password_button}
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