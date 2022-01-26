import React from 'react';
import { Alert } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';

import AppleSvg from '../../assets/apple.svg';
import GoogleSvg from '../../assets/google.svg';
import LogoSvg from '../../assets/logo.svg';
import { SignInSocialButton } from '../../components/SignInSocialButton';

import { useAuth } from '../../hooks/auth';

import {
  Container,
  Header,
  TitleWrapper,
  Title,
  SignInTitle,
  Footer,
  FooterWrapper
} from './styles';

export function SignIn() {
  const { signInWithGoogle } = useAuth();

  async function handleSignInWithGoogle(){
    try {
      await signInWithGoogle();
    }catch(e) {
      console.error(e)
      //todo : retirar error do alert
      Alert.alert('Erro ao tentar logar com Google: '+ e);
    }
  }

  async function handleSignInWithApple(){
    try {
      signInWithApple();
    }catch(e) {
      console.error(e)
      //todo : retirar error do alert
      Alert.alert('Erro ao tentar logar com Apple: '+ e);
    }
  }

  return(
    <Container>
      <Header>
        <TitleWrapper>
          <LogoSvg 
            width={RFValue(120)}
            height={RFValue(68)}
          />
          <Title>
            Controle suas {'\n'}
            finanças de forma {'\n'}
            muito simples
          </Title>
        </TitleWrapper>
        <SignInTitle>
          Faça seu login com {'\n'}
          uma das contas abaixo
        </SignInTitle>
      
      </Header>

      <Footer>
        <FooterWrapper>
          <SignInSocialButton 
            title="Entrar com Google" 
            svg={GoogleSvg} 
            onPress={handleSignInWithGoogle}
            />
          
          <SignInSocialButton 
            title="Entrar com Apple" 
            svg={AppleSvg} 
          />
          {
            // TODO: FAZER LOGIN APPLE
          }
        </FooterWrapper>
      </Footer>

    </Container>
  )
}

function signInWithApple() {
  throw new Error('Function not implemented.');
}
