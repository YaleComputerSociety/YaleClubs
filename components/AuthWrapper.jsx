// AuthWrapper.jsx
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';

const AuthWrapper = ({ children }) => {
  const navigation = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const loginStatus = await AsyncStorage.getItem('login');
        setIsAuthenticated(!!loginStatus);
      } catch (error) {
        console.error('Error checking authentication:', error);
      }
    };

    checkAuthentication();
  }, []);

  useEffect(() => {
    if (isAuthenticated === false) {
      // navigation.push('/login');
    }
  }, [isAuthenticated, navigation]);

  if (isAuthenticated === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return <>{children}</>;
};

export default AuthWrapper;
