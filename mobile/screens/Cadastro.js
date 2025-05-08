import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import axios from 'axios';
import { API_URL } from '@env';

export default function Cadastro({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const cadastrar = async () => {
    try {
      await axios.post(`${API_URL}/cadastro`, { username, email, senha });
      Alert.alert("Sucesso", "Usuário cadastrado");
      navigation.navigate("Login");
    } catch (e) {
      Alert.alert("Erro", "Não foi possível cadastrar");
    }
  };

  return (
    <View>
      <TextInput placeholder="Nome de usuário" onChangeText={setUsername} />
      <TextInput placeholder="Email" onChangeText={setEmail} />
      <TextInput placeholder="Senha" secureTextEntry onChangeText={setSenha} />
      <Button title="Cadastrar" onPress={cadastrar} />
    </View>
  );
}
