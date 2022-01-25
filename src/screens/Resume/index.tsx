import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RFValue } from 'react-native-responsive-fontsize';
import { useTheme } from 'styled-components';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { VictoryPie } from 'victory-native';

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
} from './styles'
import { categories } from '../../utils/categories';


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
  const [ totalByCategories, setTotalByCategories ] = useState<CategoryData[]>([]);

  const theme = useTheme();

  async function loadData(){
    const dataKey = '@gofinances:transactions';
    const result = await AsyncStorage.getItem(dataKey);
    const resultFormatted = result ? JSON.parse(result) : [];
    
    const expensively = resultFormatted
      .filter((item: Props) => item.type === 'negative')

    
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
  }
  
  useEffect(() => {
    loadData();
  },[])
  
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
            <MonthSelectIcon name="chevron-left" />
          </MonthSelectButton>
          
          <Month>Janeiro</Month>
          <MonthSelectButton>
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
    </Container>
  )
}