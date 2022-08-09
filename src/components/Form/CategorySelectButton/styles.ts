import styled from 'styled-components/native';
import { Feather } from '@expo/vector-icons';
import { RFValue } from 'react-native-responsive-fontsize';
import { RectButton } from 'react-native-gesture-handler';

export const Container = styled(RectButton).attrs({
    activeOpacity: 0.7
})`
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: ${RFValue(16)}px ${RFValue(18)}px;
    background-color: ${({ theme }) => theme.colors.shape};
    color: ${({ theme }) => theme.colors.text};
    font-family: ${({ theme }) => theme.fonts.regular};
    font-size: ${RFValue(14)}px;
    border-radius: 5px;
    margin: ${RFValue(8)}px 0;
`;

export const Category = styled.Text`
    font-family: ${({ theme }) => theme.fonts.regular};
    font-size: ${RFValue(14)}px;
`;

export const Icon = styled(Feather)`
    font-size: ${RFValue(20)}px;
    color: ${({ theme }) => theme.colors.text};
`;

export const IconFeather = styled(Feather)`
    color: ${({ theme }) => theme.colors.text};
    font-size: ${RFValue(18)}px;
    margin-right: 10px;
`;