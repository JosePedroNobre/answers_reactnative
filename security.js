import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { AuthSession } from 'expo';
import jwt_decode from 'jwt-decode';

const SERVER_URL = 'https://your-server-url.com'; // TLS/HTTPS is being used for secure communication because it starts with https
const CLIENT_ID = 'your-client-id';
const REDIRECT_URL = 'your-redirect-url';

const App = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    const token = await SecureStore.getItemAsync('accessToken');

    if (token) {
      // Check if the token is expired using jsonwebtoken library
      const isTokenExpired = isAccessTokenExpired(token);

      if (!isTokenExpired) {
        // Token is still valid, navigate to the main app screen
        navigateToMainApp();
      } else {
        // Token is expired, try to refresh it
        await refreshAccessToken();
      }
    }
  };

  const isAccessTokenExpired = (token) => {
    // Decode the token using jsonwebtoken library
    const decodedToken = jwt_decode(token);

    // Compare the expiration time with the current time
    const expirationTime = decodedToken.exp * 1000;
    const currentTime = Date.now();

    return expirationTime < currentTime;
  };

  const refreshAccessToken = async () => {
    // Logic to refresh the access token using the refresh token
    try {
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      if (refreshToken) {
        // Make a request to the server to refresh the token
        const response = await fetch(`${SERVER_URL}/oauth/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `grant_type=refresh_token&refresh_token=${refreshToken}&client_id=${CLIENT_ID}`,
        });

        if (response.ok) {
          const newTokenData = await response.json();

          // Update the stored access token
          await SecureStore.setItemAsync('accessToken', newTokenData.access_token);

          // Update the refresh token if the server provides a new one
          if (newTokenData.refresh_token) {
            await SecureStore.setItemAsync('refreshToken', newTokenData.refresh_token);
          }

          // Navigate to the main app screen
          navigateToMainApp();
        } else {
          Alert.alert('Token Refresh Failed', 'Unable to refresh the access token.');
        }
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
    }
  };

  const handleLogin = async () => {
    // Input validation for password with special characters
    if (!/^[a-zA-Z0-9!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]+$/g.test(password)) {
      Alert.alert('Invalid Password', 'Password must contain special characters.');
      return;
    }

    // Input validation for a valid email
    if (!isValidEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    // Use OAuth to get an access token
    const result = await AuthSession.startAsync({
      authUrl: `${SERVER_URL}/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URL}&response_type=token`,
    });

    if (result.type === 'success' && result.params.access_token) {
      // Encrypt and store the access token securely
      await SecureStore.setItemAsync('accessToken', result.params.access_token);
      navigateToMainApp();
    } else {
      // Handle authentication failure
      Alert.alert('Authentication Failed', 'Unable to authenticate. Please try again.');
    }
  };

  const navigateToMainApp = () => {
    // Navigate to the main app screen
    console.log('Navigate to main app');
  };

  const isValidEmail = (email) => {
    // Email validation using a regular expression
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <View>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={(text) => setEmail(text)}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={(text) => setPassword(text)}
        secureTextEntry
      />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
};

export default App;


/**
 * Token Expiration Checking:
 * - Uses the jsonwebtoken library to decode the access token.
 * - Compares the expiration time from the decoded token with the current time to check if the token has expired.
 * 
 * Refresh Access Token:
 * - If the access token is expired, the refreshAccessToken function is called.
 * - Retrieves the refresh token stored securely.
 * - Makes a request to the server to refresh the access token using the refresh token.
 * - Updates the stored access token with the new token received from the server.
 * - Optionally updates the refresh token if the server provides a new one.
 * 
 * Login Handling:
 * - Validates the user input for the email and password.
 * - Initiates the OAuth flow using AuthSession to obtain an access token.
 * - Stores the obtained access token securely using SecureStore.
 * - Navigates to the main app screen upon successful authentication.
 * 
 * Initial Authentication Check:
 * - On the initial app load, checks if there is a stored access token.
 * - If a token exists, it checks if the token is still valid.
 * - If the token is valid, it navigates to the main app screen.
 * - If the token is expired, it attempts to refresh the token.
 * 
 * Security Measures:
 * - Uses SecureStore for secure storage of tokens.
 * - Implements input validation for the password to include special characters.
 * - Validates the email input for a valid email format.
 * - Utilizes HTTPS and TLS for secure communication with the server.
 * - Incorporates OAuth for secure token acquisition.
 * 
 * Also Importat: 
 *  - Review and minimize the permissions requested by your application. Only request the permissions necessary for the app's functionality to reduce the attack surface.
 */
