import styled from "styled-components/native";

export const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

export const Load = styled.ActivityIndicator.attrs({
  size: "large",
  color: "#5636D3",// primary color
})``;