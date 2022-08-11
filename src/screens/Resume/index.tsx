import React, { useEffect, useState } from 'react';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RFValue } from 'react-native-responsive-fontsize';
import { VictoryPie } from "victory-native";

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
  const [totalByCategories, setTotalByCategories] = useState<ICategoryData[]>([])

  const theme = useTheme();

  async function loadData() {
    const dataKey = "@gofinances:transactions";
    const response = await AsyncStorage.getItem(dataKey);
    const responseFormatted = response ? JSON.parse(response) : [];

    const expensives = responseFormatted
      .filter((expensive: ITransactionData) => expensive.type === 'negative')

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
  }

  useEffect(() => {
    loadData();
  }, [])

  return (
    <Container>
      <Header>
        <Title>Resumo por categoria</Title>
      </Header>
      <Content
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: useBottomTabBarHeight(),

        }}
      >
        <MonthSelect>
          <MonthSelectButton>
            <MonthSelectIcon name="chevron-left"/>
          </MonthSelectButton>

          <Month>Agosto</Month>

          <MonthSelectButton>
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
    </Container>
  )
}
