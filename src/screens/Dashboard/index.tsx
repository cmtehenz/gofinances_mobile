import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from 'styled-components';

import { HighlightCard } from '../../components/HighlightCard';
import { TransactionCard, TransactionCardProps } from '../../components/TransactionCard';

import { 
  Container, 
  Header,
  User,
  UserWrapper,
  UserInfo,
  Photo,
  UserGreeting,
  UserName,
  Icon,
  HighlightCards,
  Transactions,
  Title,
  TransactionList,
  LogoutButton,
  LoadContainer,
} from './styles';

export interface DataListProps extends TransactionCardProps {
 id: string
}

interface HighlightProps {
  amount: string;
}

interface HighlightDataProps {
  entries: HighlightProps;
  expenses: HighlightProps;
  total: HighlightProps;
}

export function Dashboard(){
  const [ isLoading, setIsLoading ] = useState(true);
  const [ data, setData ] = useState<DataListProps[]>([]);
  const [ highlightData, setHighlightData ] = useState<HighlightDataProps>({} as HighlightDataProps);

  const theme = useTheme();

  async function loadTransactions(){
    const dataKey = '@gofinances:transactions';
    const response = await AsyncStorage.getItem(dataKey);
    const transactions = response ? JSON.parse(response) : [];

    let entriesTotal = 0;
    let expensiveTotal = 0;

    const formattedData: DataListProps[] = transactions
    .map((item: DataListProps) => {
        if(item.type === 'positive'){
          entriesTotal += Number(item.amount);
        }else{
          expensiveTotal += Number(item.amount);
        }
        
        
        const amount = Number(item.amount).toLocaleString('pt-BR', {
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

    setData(formattedData);
    
    const total = entriesTotal - expensiveTotal;
    
    setHighlightData({
      entries: {
        amount: entriesTotal.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        })
      },
      expenses: {
        amount: expensiveTotal.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        })
      },
      total: {
        amount: total?.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        })
      }
    })

    setIsLoading(false);
  }

  useEffect(() => {
    loadTransactions();
  },[]);

  useFocusEffect(useCallback(() => {
    loadTransactions();
  },[]))

  return (
    <Container>
      
      {
        isLoading ? 
        <LoadContainer>
          <ActivityIndicator 
            color={theme.colors.primary}
            size="large"
          />
        </LoadContainer>
         :
      <> 
        <Header>
          <UserWrapper>
            <UserInfo>
              <Photo source={{ uri: 'https://avatars.githubusercontent.com/u/10881123?v=4'}} />
              <User>
                <UserGreeting>Olá,</UserGreeting>
                <UserName>Gustavo</UserName>
              </User>
            </UserInfo>
            
            <LogoutButton onPress={() => {}}>
              <Icon name="power"/>
            </LogoutButton>
          </UserWrapper>        
        </Header>
        <HighlightCards >
          <HighlightCard 
            type="up"
            title="Entradas"
            amount={highlightData?.entries?.amount}
            lastTransaction="Última entrada dia 09 de setembro"
          />
          <HighlightCard
            type="down" 
            title="Saídas"
            amount={highlightData?.expenses?.amount}
            lastTransaction="Última saída dia 02 de outubro"
          />
          <HighlightCard
            type="total" 
            title="Total"
            amount={highlightData?.total?.amount}
            lastTransaction="01 à 20 de outubro"
          />
        </HighlightCards>  

        <Transactions>
          <Title>Listagem</Title>
          
          <TransactionList 
            data={data}
            keyExtractor={item => item.id }
            renderItem={({ item }) => <TransactionCard data={item} />}
          />
            
        </Transactions>
        </>
      }
    </Container>
  )
}