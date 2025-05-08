import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import axios from 'axios';
import { API_URL } from '@env';

export default function Home() {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    axios.get(`${API_URL}/total-usuarios`)
      .then(res => setTotal(res.data.total))
      .catch(() => setTotal("Erro ao buscar"));
  }, []);

  return (
    <View>
      <Text>Total de usuários cadastrados: {total}</Text>
    </View>
  );
}
