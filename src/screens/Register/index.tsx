import React, { useState } from 'react';
import { Modal } from 'react-native';
import { useForm } from 'react-hook-form';

import { Button } from '../../components/Form/Button';
import { CategorySelectButton } from '../../components/Form/CategorySelectButton';
import { InputForm } from '../../components/Form/InputForm';
import { TransactionTypeButton } from '../../components/Form/TransactionTypeButton';

import { CategorySelect } from '../CategorySelect';

import {
  Container,
  Header,
  Title,
  Form,
  Fields,
  TransactionsTypes
} from './styles';

interface FormData {
  name: string;
  amount: string;
}

export function Register(){
  const [ transactionType, setTransactionType ] = useState('');
  const [ categoryModalOpen, setCategoryModalOpen ] = useState(false);

  const [ category, setCategory ] = useState({
    key: 'category',
    name: 'Categoria',
  });

  const {
    control,
    handleSubmit,
  } = useForm();

  function handleTransactionTypeSelect(type: 'up' | 'down'){
    setTransactionType(type);
  }

  function handleOpenSelectCategoryModal(){
    setCategoryModalOpen(true);   
  }

  function handleCloseSelectCategoryModal(){  //
    setCategoryModalOpen(false);   
  }

  function handleRegister(form: FormData){
    const data = {
      name: form.name,
      amount: form.amount,
      transactionType,
      category: category.key
    }
    console.log(data)
  }
  
  return(
    <Container>
      <Header>
        <Title>Cadastro</Title>
      </Header>
      <Form>
        <Fields>
          <InputForm 
            placeholder='Nome'
            name="name"
            control={control}
          />
          <InputForm 
            placeholder='Preço'
            name="amount"
            control={control}
          />
          <TransactionsTypes>
            <TransactionTypeButton 
              type="up"
              title="Entrada"
              onPress={() => handleTransactionTypeSelect('up')}
              isActive={transactionType === 'up'}
            />
            <TransactionTypeButton 
              type="down"
              title="Saida"
              onPress={() => handleTransactionTypeSelect('down')}
              isActive={transactionType === 'down'}
            />
          </TransactionsTypes>
          <CategorySelectButton 
            title={category.name}
            onPress={handleOpenSelectCategoryModal}
          />
        </Fields>
        

        <Button 
          title="Enviar"
          onPress={handleSubmit(handleRegister)}
        />
      </Form>
      <Modal
        onRequestClose={() => {}}
        visible={categoryModalOpen}
        >
        <CategorySelect 
          category={category}
          setCategory={setCategory}
          closeSelectCategory={handleCloseSelectCategoryModal}
        />
      </Modal>
    </Container>
  )
}