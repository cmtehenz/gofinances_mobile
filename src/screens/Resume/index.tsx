import React, { useCallback, useState } from 'react';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RFValue } from 'react-native-responsive-fontsize';
import { VictoryPie } from "victory-native";
import { addMonths, subMonths, format } from "date-fns";
import { ptBR } from 'date-fns/locale';

import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useTheme } from 'styled-components';

import { categories } from '@/utils/categories';
import { HistoryCard } from '@/components/HistoryCard';

import { 
  Container,
  Header,
  Title,
  Content,
  ChartContainer,
  MonthSelect,
  MonthSelectButton,
  MonthSelectIcon,
  Month
} from './styles';
import { Loading } from '@/components/Loading';
import { useFocusEffect } from '@react-navigation/native';

interface ITransactionData {
  type: 'positive' | 'negative';
  name: string;
  amount: string;
  category: string;
  date: string;
}

interface ICategoryData {
  key: string;
  name: string;
  total: number;
  totalFormatted: string;
  color: string;
  percent: string;
}

export function Resume() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date()); 
  const [totalByCategories, setTotalByCategories] = useState<ICategoryData[]>([])

  const theme = useTheme();

  function handleChangeDate(action: 'next' | 'prev'): void {
    if(action === 'next'){
      const newDate = addMonths(selectedDate, 1);
      setSelectedDate(newDate);
    }else{
      const newDate = subMonths(selectedDate, 1);
      setSelectedDate(newDate);
    }
  }

  async function loadData() {
    setIsLoading(true);
    const dataKey = "@gofinances:transactions";
    const response = await AsyncStorage.getItem(dataKey);
    const responseFormatted = response ? JSON.parse(response) : [];

    const expensives = responseFormatted
      .filter((expensive: ITransactionData) => 
      expensive.type === 'negative' && 
      new Date(expensive.date).getMonth() === selectedDate.getMonth() &&
      new Date(expensive.date).getFullYear() === selectedDate.getFullYear()
      );

      const expensiveTotal = expensives
        .reduce((accumulator: number, expensive: ITransactionData)  => {
          return accumulator + Number(expensive.amount);
        }, 0);
      
      const totalByCategory: ICategoryData[] = [];

      categories.forEach(category => {
        let categorySum = 0;
        expensives.forEach(item => {
          if(item.category === category.key){
            categorySum += Number(item.amount);
          }
        });

        if(categorySum > 0){
          const total = categorySum
            .toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            })
          
          const percent = `${(categorySum / expensiveTotal * 100).toFixed(0)}%`;

          totalByCategory.push({
            key: category.key,
            name: category.name,
            color: category.color,
            total: categorySum,
            totalFormatted: total,
            percent  
          });
        }
      });
      
      setTotalByCategories(totalByCategory);
      setIsLoading(false);
  }

  useFocusEffect(useCallback(() => {
    loadData();
  },[selectedDate]));

  return (
    <Container>
      <Header>
        <Title>Resumo por categoria</Title>
      </Header>
      
      {
        isLoading ?
        <Loading /> :
        <>
          
          <Content
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingBottom: useBottomTabBarHeight(),

            }}
          >
            <MonthSelect>
              <MonthSelectButton onPress={() => handleChangeDate('prev')} >
                <MonthSelectIcon name="chevron-left"/>
              </MonthSelectButton>

              <Month>
                { format(selectedDate, 'MMMM, yyyy', { locale: ptBR }) }
              </Month>

              <MonthSelectButton onPress={() => handleChangeDate('next')} >
                <MonthSelectIcon name="chevron-right"/>
              </MonthSelectButton>
            </MonthSelect>

            <ChartContainer>
              <VictoryPie 
                data={totalByCategories}
                colorScale={totalByCategories.map(category => category.color)}
                style={{
                  labels: {
                    fontSize: RFValue(18),
                    fontWeight: 'bold',
                    fill: theme.colors.shape,
                  }
                }}
                labelRadius={80}
                x="percent"
                y="total"
              />
            </ChartContainer>
            
            {
              totalByCategories.map(item => (
                <HistoryCard 
                  key={item.key}
                  title={item.name}
                  amount={item.totalFormatted}
                  color={item.color}
                />
              ))
            }

          </Content>
        
        </>
      }
      
    </Container>
  )
}
