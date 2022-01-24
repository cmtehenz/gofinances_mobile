import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  TouchableWithoutFeedback, 
  Keyboard,
  Alert, 
} from 'react-native';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import uuid from 'react-native-uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useForm } from 'react-hook-form'
import { useNavigation } from '@react-navigation/native'

import { InputForm } from '../../components/Form/InputForm'
import { Button } from '../../components/Form/Button';
import { TransactionTypeButton } from '../../components/Form/TransactionTypeButton';
import { CategorySelectButton } from '../../components/Form/CategorySelectButton';

import { CategorySelect } from '../CategorySelect';

import { 
  Container,
  Header,
  Title,
  Form,
  Fields,
  TransactionTypes,
} from './styles';

interface FormData {
  name: string;
  amount: string;
}

const schema = Yup.object().shape({
  name: Yup
    .string()
    .required('Nome é obrigatório'),
  amount: Yup
    .number()
    .typeError('Informe um valor numérico')
    .positive('O valor não pode ser um numero negativo')
    .required('Valor obrigatório')
})


export function Register() {
  const [transactionType, setTransactionType] = useState('');
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  const dataKey = '@gofinances:transactions';

  const [category, setCategory] = useState({
    key: 'category',
    name: 'Categoria',
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema)
  });

  function handleTransactionTypeSelect(type: 'up' | 'down'){
    setTransactionType(type);
  }

  function handleOpenSelectionCategoryModal () {
    setCategoryModalOpen(true);
  }

  function handleCloseSelectionCategoryModal () {
    setCategoryModalOpen(false);
  }

  async function handleRegister(form: FormData) {
    if(!transactionType)
      return Alert.alert('Selecione o tipo da Transação')
    
    if(category.key === 'category')
      return Alert.alert('Selecione uma categoria');

    const newTransaction = {
      id: String(uuid.v4()),
      name: form.name,
      amount: form.amount,
      transactionType,
      category: category.key,
      date: new Date(),
    }

    try {
      const data = await AsyncStorage.getItem(dataKey);
      const currentData = data ? JSON.parse(data) : [];

      const dataFormatted = [
        ...currentData,
        newTransaction
      ] 

      await AsyncStorage.setItem(dataKey, JSON.stringify(dataFormatted));
      
      reset();
      setTransactionType('');
      setCategory({
        key: 'category',
        name: 'Categoria'
      });

    } catch (error) {
      console.log(error);
      Alert.alert("Não foi possível salvar");
    }
  }

  useEffect(() => {
    async function loadData(){
      const data = await AsyncStorage.getItem(dataKey);
      console.log(JSON.parse(data!));
    }

    loadData();

  }, []);

  return (
    <TouchableWithoutFeedback
      onPress={Keyboard.dismiss}
    >
    <Container> 
      <Header>
        <Title>Cadastro</Title>

      </Header>
      <Form>
        <Fields>
          <InputForm
            control={control}
            name="name" 
            placeholder="Nome"
            autoCapitalize="sentences"
            autoCorrect={false}
            error={errors.name && errors.name.message}
          />
          <InputForm 
            control={control}
            name="amount"
            placeholder="Preço"
            keyboardType="numeric"
            error={errors.amount && errors.amount.message}
          />
          <TransactionTypes>
            <TransactionTypeButton 
              type="up"
              title="Entrada"
              onPress={() => handleTransactionTypeSelect('up')}
              isActive={transactionType === 'up'}
            />
            <TransactionTypeButton 
              type="down"
              title="Saída"
              onPress={() => handleTransactionTypeSelect('down')}
              isActive={transactionType === 'down'}
            />
          </TransactionTypes>
          <CategorySelectButton 
            title={category.name}
            onPress={handleOpenSelectionCategoryModal}
          />
        </Fields>
        
        <Button 
          title="Enviar"
          onPress={handleSubmit(handleRegister)}
        />
        
      </Form>

      <Modal visible={categoryModalOpen}>
        <CategorySelect 
          category={category}
          setCategory={setCategory}
          closeSelectCategory={handleCloseSelectionCategoryModal}
        />
      </Modal>
    </Container>
    </TouchableWithoutFeedback>
  )
}