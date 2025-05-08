import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import axios from 'axios';
import { API_URL } from '@env';

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const fazerLogin = async () => {
    try {
      const res = await axios.post(`${API_URL}/login`, { email, senha });
      navigation.navigate("Home");
    } catch (e) {
      Alert.alert("Erro", "Credenciais inválidas");
    }
  };

  return (
    <View>
      <TextInput placeholder="Email" onChangeText={setEmail} />
      <TextInput placeholder="Senha" secureTextEntry onChangeText={setSenha} />
      <Button title="Entrar" onPress={fazerLogin} />
      <Button title="Cadastrar" onPress={() => navigation.navigate("Cadastro")} />
    </View>
  );
}
