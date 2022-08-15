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
import { Loading } from '@/components/Loading';

export interface DataListProps extends ITransactionCardProps {
  id: string;
}

interface IHighlightProps {
  amount: string;
  lastTransaction: string;
}

interface IHighlightData {
  entries: IHighlightProps;
  expensive: IHighlightProps;
  total: IHighlightProps; 
}

export function Dashboard(){
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<DataListProps[]>([]);
  const [highlightData, setHighlightData] = useState<IHighlightData>({} as IHighlightData);

  const theme = useTheme();

  function getLastTransactionDate(
    collection: DataListProps[], 
    type: 'positive' | 'negative'
  ){
      const lastTransaction = new Date(
      Math.max.apply(Math, collection
        .filter(transaction => transaction.type === type)
        .map(transaction => new Date(transaction.date).getTime())));
        
        return `${lastTransaction.getDate()} de ${lastTransaction.toLocaleString('pt-BR', {
          month: 'long'
        })}`;
  }

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
    
    const lastEntries = getLastTransactionDate(transactions, 'positive');
    const lastExpense = getLastTransactionDate(transactions, 'negative');
    const totalInterval = `01 a ${lastExpense}`;

    const total = entriesTotal - expensiveTotal;

    setHighlightData({
      entries: {
        amount: entriesTotal.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }),
        lastTransaction: `Última entrada dia ${lastEntries}`
      },
      expensive: {
        amount: expensiveTotal.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }),
        lastTransaction: `Última saída dia ${lastExpense}`
      },
      total: {
        amount: total.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }),
        lastTransaction: totalInterval
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
        <Loading /> :
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
              lastTransaction={highlightData.entries?.lastTransaction}
            />
            <HighlightCard
              type="down" 
              title="Saídas"
              amount={highlightData.expensive?.amount}
              lastTransaction={highlightData.expensive?.lastTransaction}
            />
            <HighlightCard
              type="total" 
              title="Total"
              amount={highlightData.total?.amount}
              lastTransaction={highlightData.total?.lastTransaction}
            />
          </HighlightCards>
          <Transactions>
            <Title>Listagem</Title>

            <TransactionList 
              data={data} //@ts-ignore
              keyExtractor={item => item.id} //@ts-ignore
              renderItem={({ item }) => <TransactionCard data={item}/> }
            />
          </Transactions>
        </>
      }
    </Container>
  )
}