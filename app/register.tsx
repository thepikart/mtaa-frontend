// register.tsx
// @module RegisterScreen

import React from 'react';
import {
  Text,
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useUserStore } from '@/stores/userStore';
import { useMode } from '@/hooks/useMode';

/**
 * RegisterScreen component
 *
 * Renders a registration form for new users to create an account.
 * Includes fields for name, surname, username, email, and password.
 * On success, navigates to the home screen; on failure, shows an alert.
 *
 * @component
 * @returns {JSX.Element} The registration screen UI.
 */
const RegisterScreen: React.FC = (): JSX.Element => {
  const mode = useMode();
  const router = useRouter();
  const [name, setName] = useState<string>('');
  const [surname, setSurname] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  /**
   * Handles account creation by calling the userStore createAccount method.
   * If successful, replaces the current route with '/home'.
   * Otherwise, displays an alert with the error message.
   *
   * @async
   * @function handleCreateAccount
   * @returns {Promise<void>}
   */
  const handleCreateAccount = async (): Promise<void> => {
    const createAccountProps = { name, surname, username, email, password };
    const result = await useUserStore.getState().createAccount(createAccountProps);
    if (result.success) {
      router.replace('/home');
    } else {
      Alert.alert('Create Account Error', result.message);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.contentContainer,
        { backgroundColor: mode.background },
      ]}
    >
      <Text style={[styles.headerText, { color: mode.text }]}>Eventix</Text>

      <View style={styles.inputContainer}>
        {/* Name Input */}
        <Text style={[styles.text, { color: mode.text }]}>Name</Text>
        <TextInput
          style={[styles.input, { borderColor: mode.borderInput, color: mode.text }]}
          placeholder="Name"
          placeholderTextColor={mode.textPlaceholder}
          value={name}
          onChangeText={setName}
        />

        {/* Surname Input */}
        <Text style={[styles.text, { color: mode.text }]}>Surname</Text>
        <TextInput
          style={[styles.input, { borderColor: mode.borderInput, color: mode.text }]}
          placeholder="Surname"
          placeholderTextColor={mode.textPlaceholder}
          value={surname}
          onChangeText={setSurname}
        />

        {/* Username Input */}
        <Text style={[styles.text, { color: mode.text }]}>Username</Text>
        <TextInput
          style={[styles.input, { borderColor: mode.borderInput, color: mode.text }]}
          placeholder="Username"
          placeholderTextColor={mode.textPlaceholder}
          value={username}
          onChangeText={setUsername}
        />

        {/* Email Input */}
        <Text style={[styles.text, { color: mode.text }]}>Email</Text>
        <TextInput
          style={[styles.input, { borderColor: mode.borderInput, color: mode.text }]}
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
          style={[styles.input, { borderColor: mode.borderInput, color: mode.text }]}
          placeholder="Password"
          placeholderTextColor={mode.textPlaceholder}
          secureTextEntry={true}
          autoCapitalize="none"
          autoCorrect={false}
          value={password}
          onChangeText={setPassword}
        />

        {/* Repeat Password Input (not stored) */}
        <Text style={[styles.text, { color: mode.text }]}>Repeat Password</Text>
        <TextInput
          style={[styles.input, { borderColor: mode.borderInput, color: mode.text }]}
          placeholder="Repeat Password"
          placeholderTextColor={mode.textPlaceholder}
          secureTextEntry={true}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* Create Account Button */}
      <TouchableOpacity style={styles.button} onPress={handleCreateAccount}>
        <Text style={styles.buttonText}>Create account</Text>
      </TouchableOpacity>

      {/* Redirect to Login */}
      <View style={styles.redirectContainer}>
        <Text style={[styles.redirectText, { color: mode.text }]}>Already have an account? </Text>
        <Text
          style={[styles.redirectLink, { color: mode.text }]}
          onPress={() => router.replace('/login')}
        >
          Log in
        </Text>
      </View>
    </ScrollView>
  );
};

/**
 * Styles for RegisterScreen component.
 */
const styles = StyleSheet.create({
  /**
   * Container style for ScrollView content alignment.
   */
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },

  /**
   * Header text style for the app title.
   */
  headerText: {
    fontSize: 34,
    fontWeight: '500',
    marginBottom: '10%',
  },

  /**
   * Input field style for all text inputs.
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
   * Container wrapping all input fields.
   */
  inputContainer: {
    width: '80%',
    maxWidth: 400,
  },

  /**
   * Style for the create account button.
   */
  button: {
    marginTop: 9,
    width: '40%',
    maxWidth: 200,
    height: 40,
    backgroundColor: '#000000',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /**
   * Text style inside the create account button.
   */
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },

  /**
   * Container for the login redirect link.
   */
  redirectContainer: {
    flexDirection: 'row',
    marginTop: '10%',
  },

  /**
   * Regular text prompting login.
   */
  redirectText: {
    fontSize: 16,
  },

  /**
   * Link text style for navigating to login screen.
   */
  redirectLink: {
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});

export default RegisterScreen;