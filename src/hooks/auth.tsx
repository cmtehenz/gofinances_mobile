import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import * as AuthSession from 'expo-auth-session';
import * as AppleAuthentication from 'expo-apple-authentication';
import AsyncStorage from "@react-native-async-storage/async-storage";

const { GOOGLE_CLIENT_ID } = process.env;
const { EXPO_REDIRECT_URI } = process.env;
const { GOOGLE_RESPONSE_TYPE } = process.env;
const { USER_LOCAL_STORAGE_USER_KEY } = process.env;

interface IAuthProviderProps {
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
  signInWithGoogle(): Promise<void>;
  signInWithApple(): Promise<void>;
  signOut(): Promise<void>;
  userStorageLoading: boolean;
}

interface IAuthorizationResponse {
  params: {
    access_token: string;
  },
  type: string;
}

const AuthContext = createContext({} as IAuthContextData);

function AuthProvider({ children }: IAuthProviderProps) {
  const [user, setUser] = useState<IUser>({} as IUser);
  const [userStorageLoading, setUserStorageLoading] = useState(true);

  async function signInWithGoogle(){
    try{
      const SCOPE = encodeURI('profile email');

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${EXPO_REDIRECT_URI}&response_type=${GOOGLE_RESPONSE_TYPE}&scope=${SCOPE}`;
      
      const { type, params } = await AuthSession
        .startAsync({ authUrl }) as IAuthorizationResponse;
      
      if(type === 'success'){
        const response =  await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${params.access_token}`);
        const userInfo = await response.json();
        const userLogged = {
          id: String(userInfo.id),
          email: userInfo.email,
          name: userInfo.given_name,
          photo: userInfo.picture
        }
        setUser(userLogged);
        await AsyncStorage.setItem( USER_LOCAL_STORAGE_USER_KEY, JSON.stringify(userLogged));
      }
      

    }catch(error){
      throw new Error(error)
    }
  }

  async function signInWithApple(){
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL
        ]
      });

      if(credential){
        const name = credential.fullName!.givenName!;
        const photo = `https://ui-avatars.com/api/?name=${name}&length=1`;
        
        const userLogged = {
          id: String(credential.user),
          email: credential.email!,
          name,
          photo,
        }
        setUser(userLogged);
        await AsyncStorage.setItem( USER_LOCAL_STORAGE_USER_KEY, JSON.stringify(userLogged));
      }

    } catch (error) {
      throw new Error(error)
    }
  }

  async function signOut(){
    setUser({} as IUser);
    await AsyncStorage.removeItem( USER_LOCAL_STORAGE_USER_KEY);
  }

  useEffect(() => {
    async function loadUserStorageData(){
      const userStored = await AsyncStorage.getItem(USER_LOCAL_STORAGE_USER_KEY);
      
      if(userStored){
        const userLogged = JSON.parse(userStored) as IUser;
        setUser(userLogged);
      }
      setUserStorageLoading(false);
    }

    loadUserStorageData();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      signInWithGoogle,
      signInWithApple,
      userStorageLoading,
      signOut 
    }} >
      { children } 
    </AuthContext.Provider>
  )
}

function useAuth(){
  const context = useContext(AuthContext);

  return context;
}

export { AuthProvider , useAuth}