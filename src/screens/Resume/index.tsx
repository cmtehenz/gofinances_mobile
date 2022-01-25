import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RFValue } from 'react-native-responsive-fontsize';
import { useTheme } from 'styled-components';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { VictoryPie } from 'victory-native';
import { addMonths, subMonths, format } from 'date-fns';
import { ptBR } from 'date-fns/locale'; 

import { HistoryCard } from '../../components/HistoryCard';

import { 
  Container,
  Header,
  Title,
  Content,
  ChartContainer,
  MonthSelect,
  MonthSelectButton,
  MonthSelectIcon,
  Month,
  LoadContainer
} from './styles'
import { categories } from '../../utils/categories';
import { useFocusEffect } from '@react-navigation/native';


export interface Props {
  type: 'positive' | 'negative';
  name: string;
  amount: string;
  category: string;
  date: string;
}

interface CategoryData {
  key: string;
  name: string;
  total: number;
  totalFormatted: string;
  color: string;
  percent: string;
}

export function Resume(){
  const [ isLoading, setIsLoading] = useState(false);
  const [ selectedDate, setSelectedDate ] = useState(new Date());
  const [ totalByCategories, setTotalByCategories ] = useState<CategoryData[]>([]);

  const theme = useTheme();

  function handleDateChange(action: 'prev' | 'next' ){  
    if(action === 'prev'){
      setSelectedDate(subMonths(selectedDate, 1));
    }else{
      setSelectedDate(addMonths(selectedDate, 1));
    }
  }

  async function loadData(){
    setIsLoading(true);
    const dataKey = '@gofinances:transactions';
    const result = await AsyncStorage.getItem(dataKey);
    const resultFormatted = result ? JSON.parse(result) : [];
    
    const expensively = resultFormatted
      .filter((item: Props) => 
        item.type === 'negative' && 
        new Date(item.date).getMonth() === selectedDate.getMonth() &&
        new Date(item.date).getFullYear() === selectedDate.getFullYear()
      )

    const expensiveTotal = expensively.reduce((accumulator: number, item: Props) => {
      return accumulator + Number(item.amount);
    }, 0)
    
    const totalByCategory: CategoryData[] = []

    categories.forEach(category => {
      let categorySum = 0;
      
      expensively.forEach((expensive: Props) => {
        if(expensive.category === category.key) {
          categorySum += Number(expensive.amount);
        }
      });

      if(categorySum > 0 ){
        const totalFormatted = categorySum.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        })

        const percent = `${((categorySum / expensiveTotal) * 100).toFixed(0)}%`;

        totalByCategory.push({
          key: category.key,
          name: category.name,
          color: category.color,
          total: categorySum,
          totalFormatted,
          percent,
        });
      }
    });

    setTotalByCategories(totalByCategory);
    setIsLoading(false);
  }

  useFocusEffect(useCallback(() => {
    loadData();
  },[selectedDate]))
  
  return (
    <Container>
      <Header>
        <Title>Resumo por categoria</Title>
      </Header>
      { isLoading ? 
        <LoadContainer>
          <ActivityIndicator
            color={theme.colors.primary}
            size="large"
          />
        </LoadContainer> :
        <>
          

          <Content
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingBottom: useBottomTabBarHeight(),
            }}
          >
            <MonthSelect>
              <MonthSelectButton onPress={() => handleDateChange('prev')}>
                <MonthSelectIcon name="chevron-left" />
              </MonthSelectButton>
              
              <Month>{ format(selectedDate, 'MMMM, yyyy', {locale: ptBR})}</Month>
              <MonthSelectButton onPress={() => handleDateChange('next')}>
                <MonthSelectIcon name="chevron-right" />
              </MonthSelectButton>
            </MonthSelect>
            
            <ChartContainer>
              <VictoryPie
                data={totalByCategories}
                colorScale = {totalByCategories.map(item => item.color)}
                style={{
                  labels: { 
                    fontSize: RFValue(18),
                    fontWeight: 'bold',
                    fill: theme.colors.shape,
                  }
                }}
                labelRadius={85}
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