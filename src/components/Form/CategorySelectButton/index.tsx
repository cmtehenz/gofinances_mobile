import React from 'react';
import { RectButtonProps } from 'react-native-gesture-handler';

import { Container, Category, Icon, IconFeather } from './styles';

interface CategorySelectButtonProps extends RectButtonProps {
    title: string;
    icon?: string;
    onPress: () => void;
}

export function CategorySelectButton({
    title,
    icon,
    onPress,
    testID
}: CategorySelectButtonProps) {
    return (
        <Container testID={testID} key="title" onPress={onPress}>
            {icon && <IconFeather name={icon} />}
            <Category>{title}</Category>
            <Icon name="chevron-down" />
        </Container>
    );
}