import 'react-native-gesture-handler';
import 'intl';
import 'intl/locale-data/jsonp/pt-BR';

import React from "react";
import { StatusBar } from "react-native";
import theme from "@global/styles/theme";

import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { ThemeProvider } from "styled-components";

import { AppRoutes } from "@/routes/app.routes";

import { SignIn } from '@screens/SignIn';

import { AuthProvider } from "./src/hooks/auth";

import { Text } from "./stylesApp";

import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return <Text>Loading...</Text>;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider theme={theme}>
        <NavigationContainer>
          <StatusBar barStyle="light-content"/>
          <AuthProvider>
            <SignIn />
          </AuthProvider>
          {/* <AppRoutes /> */}
        </NavigationContainer>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}