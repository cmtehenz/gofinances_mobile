import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import * as AuthSession from 'expo-auth-session';
import * as AppleAuthentication from 'expo-apple-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { CLIENT_ID } = process.env
const { REDIRECT_URI } = process.env

interface AuthProviderProps {
  children: ReactNode;
}

interface IUser {
  id: string;
  name: string;
  email: string;
  photo?: string;
}

interface IAuthContextData {
  user: IUser;
  signOut(): Promise<void>;
  signInWithGoogle(): Promise<void>;
  signInWithApple(): Promise<void>; 
  isUserLoading: boolean;
}

interface AuthorizationResponse {
  params: {
    access_token: string;
  },
  type: string;
}

const AuthContext = createContext({} as IAuthContextData);

function AuthProvider({ children }: AuthProviderProps){
  const [user, setUser] = useState<IUser>({} as IUser);
  const [isUserLoading, setIsUserLoading] = useState(true);

  const userStorageKey = '@gofinances:user';

  async function signInWithGoogle(){
    try {
      
      const RESPONSE_TYPE = 'token';
      const SCOPE = encodeURI('profile email');

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`;
      const {type, params} = await AuthSession
        .startAsync({ authUrl }) as AuthorizationResponse;
      
      if(type === 'success') {
        const response = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${params.access_token}`);
        const userInfo = await response.json();
        setUser({
          id: userInfo.id,
          email: userInfo.email,
          name: userInfo.name,
          photo: userInfo.picture,
        })
        await AsyncStorage.setItem(userStorageKey, JSON.stringify(userInfo))
      }
    }catch(e) {
      console.log(e);
      throw new Error();
    }
  }

  async function signInWithApple(){
    try{
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ]
      });
      if(credential){
        const name = credential.fullName!.givenName!;
        const userLogged = {
          id: String(credential.user),
          email: credential.email!,
          name: credential.fullName!.givenName!,
          photo: `https://ui-avatars.com/api/?name=${name}&length=1`
        }
        setUser(userLogged);
        await AsyncStorage.setItem(userStorageKey, JSON.stringify(userLogged))
      }

    }catch(e){
      console.log(e);
      throw new Error();
    }
  }

  async function signOut(){
    setUser({} as IUser);
    await AsyncStorage.removeItem(userStorageKey)
  }

  useEffect(() => {
    async function loadUserStorageData(){
      const userStorage = await AsyncStorage.getItem(userStorageKey);
      if(userStorage){
        const userLogged = JSON.parse(userStorage) as IUser;
        setUser(userLogged);
      }
      setIsUserLoading(false);
    }
    loadUserStorageData();
  }, [])

  return(
    <AuthContext.Provider value={{ 
      user,
      signOut,
      signInWithGoogle,
      signInWithApple,
      isUserLoading
    }}>
      { children }
    </AuthContext.Provider>
  )
}

function useAuth(){
  const context = useContext(AuthContext);

  return context;
}

export { AuthProvider, useAuth } 