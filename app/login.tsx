// login.tsx
// @module LoginScreen

import React from 'react';
import { Text, View, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '@/stores/userStore';
import { useState } from 'react';
import { useMode } from '@/hooks/useMode';

/**
 * LoginScreen component
 *
 * Renders a login form with email and password fields.
 * On successful authentication, navigates to the home screen.
 * Displays an alert on login failure.
 *
 * @component
 * @returns {JSX.Element} The login screen UI.
 */
const LoginScreen: React.FC = (): JSX.Element => {
  const mode = useMode();
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  /**
   * Handles the login action by calling the userStore login method.
   * If successful, replaces the current route with '/home'.
   * Otherwise, shows an alert with the error message.
   *
   * @async
   * @function handleLogin
   * @returns {Promise<void>}
   */
  const handleLogin = async (): Promise<void> => {
    const result = await useUserStore.getState().login(email, password);

    if (result.success) {
      router.replace('/home');
    } else {
      Alert.alert('Login Error', result.message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: mode.background }]}>      
      <Text style={[styles.headerText, { color: mode.text }]}>Eventix</Text>

      <View style={styles.inputContainer}>
        {/* Email Input */}
        <Text style={[styles.text, { color: mode.text }]}>Email</Text>
        <TextInput
          style={[styles.input, { color: mode.text, borderColor: mode.borderInput }]}
          placeholder="Email"
          placeholderTextColor={mode.textPlaceholder}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
        />

        {/* Password Input */}
        <Text style={[styles.text, { color: mode.text }]}>Password</Text>
        <TextInput
          style={[styles.input, { color: mode.text, borderColor: mode.borderInput }]}
          placeholder="Password"
          placeholderTextColor={mode.textPlaceholder}
          secureTextEntry={true}
          autoCapitalize="none"
          autoCorrect={false}
          value={password}
          onChangeText={setPassword}
        />
      </View>

      {/* Login Button */}
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      {/* Redirect to Register */}
      <View style={styles.redirectContainer}>
        <Text style={[styles.redirectText, { color: mode.text }]}>Not a user yet? </Text>
        <Text
          style={[styles.redirectLink, { color: mode.text }]}
          onPress={() => router.replace('/register')}
        >
          Create account
        </Text>
      </View>
    </View>
  );
};

/**
 * Styles for LoginScreen component
 */
const styles = StyleSheet.create({
  /**
   * Main container to center content vertically and horizontally.
   */
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  /**
   * Title text style for the app header.
   */
  headerText: {
    fontSize: 34,
    fontWeight: '500',
    marginBottom: '20%',
  },
  /**
   * Style for text inputs.
   */
  input: {
    fontSize: 16,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  /**
   * Label text style for input fields.
   */
  text: {
    fontSize: 16,
    marginBottom: 8,
  },
  /**
   * Container wrapping the form inputs.
   */
  inputContainer: {
    width: '80%',
    maxWidth: 400,
  },
  /**
   * Style for the login button.
   */
  button: {
    marginTop: 9,
    width: '35%',
    maxWidth: 200,
    height: 40,
    backgroundColor: '#000000',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  /**
   * Text style inside the login button.
   */
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  /**
   * Container for the redirect link to registration.
   */
  redirectContainer: {
    flexDirection: 'row',
    marginTop: 37,
  },
  /**
   * Regular text prompting registration.
   */
  redirectText: {
    fontSize: 16,
  },
  /**
   * Link style for the registration text.
   */
  redirectLink: {
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
