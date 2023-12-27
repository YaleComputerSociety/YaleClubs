import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';

export const AuthContext = React.createContext();

const AuthProvider = ({ children }) => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        setUserToken(token || null);
      } catch (error) {
        console.error('Error reading token from AsyncStorage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkToken();
  }, []);

  const setToken = async (newToken) => {
    try {
      await AsyncStorage.setItem('token', newToken);
      setUserToken(newToken);
    } catch (error) {
      console.error('Error setting token in AsyncStorage:', error);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      if (!userToken) {
        router.push('/login');
      }
    }
  }, [isLoading, userToken, navigation]);

  if (isLoading || !userToken) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ userToken, setToken }}>
      {userToken && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
