import React, {useCallback, useEffect, useState} from 'react';
import { ActivityIndicator } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useFocusEffect } from '@react-navigation/native';

import { useTheme } from 'styled-components';

import { 
  Container, 
  Header,
  UserWrapper,
  UserInfo,
  Photo,
  User,
  UserGreeting,
  UserName,
  Icon,
  HighlightCards,
  Transactions,
  Title,
  TransactionList,
  LogoutButton,
  LoadContainer
} from './styles';

import { HighlightCard } from '@components/HighlightCard';
import { TransactionCard, ITransactionCardProps } from '@components/TransactionCard';

export interface DataListProps extends ITransactionCardProps {
  id: string;
}

interface IHighlightProps {
  amount: string;
}

interface IHighlightData {
  entries: IHighlightProps;
  expensive: IHighlightProps;
  total: IHighlightProps; 
}

export function Dashboard(){
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<DataListProps[]>([]);
  const [highlightData, setHighlightData] = useState<IHighlightData>({} as I);

  const theme = useTheme();

  async function loadTransactions(){
    const dataKey = "@gofinances:transactions";
    // await AsyncStorage.removeItem(dataKey);
    const response = await AsyncStorage.getItem(dataKey);    
    
    const transactions = response ? JSON.parse(response) : [];
    
    let entriesTotal = 0;
    let expensiveTotal = 0;

    const transactionsFormatted: DataListProps[] = transactions
      .map((item: DataListProps) => {
        
        if(item.type === "positive"){
          entriesTotal += Number(item.amount);
        }else{
          expensiveTotal += Number(item.amount);
        }
        
        const amount = Number(item.amount)
          .toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          });
        
        const date = Intl.DateTimeFormat('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit' 
        }).format(new Date(item.date));

        return {
          id: item.id,
          name: item.name,
          amount,
          type: item.type,
          category: item.category,
          date,
        }

    });

    setData(transactionsFormatted);

    const total = entriesTotal - expensiveTotal;

    setHighlightData({
      entries: {
        amount: entriesTotal.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }),
      },
      expensive: {
        amount: expensiveTotal.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        })
      },
      total: {
        amount: total.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        })
      },
    });

    setIsLoading(false);
  
  }

  useEffect(() => {
    loadTransactions();
  }, [])

  useFocusEffect(useCallback(() => {
    loadTransactions();
  },[]));

  return (
    <Container>
      {
        isLoading ? 
        <LoadContainer>
          <ActivityIndicator 
            color={theme.colors.primary} 
            size="large"
          />
        </LoadContainer> :
        <> 
          <Header>
            <UserWrapper>
              <UserInfo>
                <Photo 
                  source={{ uri: 'https://avatars.githubusercontent.com/u/10881123?v=4'}}
                />
                <User>
                  <UserGreeting>Olá,</UserGreeting>
                  <UserName>Gustavo</UserName>
                </User>
              </UserInfo>
              <LogoutButton onPress={() => {}}>
                <Icon name="power" />
              </LogoutButton>   
            </UserWrapper>
          </Header>
          <HighlightCards>
            <HighlightCard
              type="up" 
              title="Entradas"
              amount={highlightData.entries?.amount}
              lastTransaction="Última entrada dia 13 de abril"
            />
            <HighlightCard
              type="down" 
              title="Saídas"
              amount={highlightData.expensive?.amount}
              lastTransaction="Última saída dia 03 de abril"
            />
            <HighlightCard
              type="total" 
              title="Total"
              amount={highlightData.total?.amount}
              lastTransaction="01 à 16 de abril"
            />
          </HighlightCards>
          <Transactions>
            <Title>Listagem</Title>

            <TransactionList 
              data={data}
              keyExtractor={item => item.id} 
              renderItem={({ item }) => <TransactionCard data={item}/> }
            />
          </Transactions>
        </>
      }
    </Container>
  )
}