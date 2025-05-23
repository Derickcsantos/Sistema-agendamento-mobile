import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';

export default function Home() {
  const [stats, setStats] = useState({
    usuarios: null,
    agendamentos: null,
    categorias: null,
    servicos: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const baseUrl = 'http://127.0.0.1:3000';
        
        // Faz todas as requisições em paralelo
        const [usuarios, agendamentos, categorias, servicos] = await Promise.all([
          axios.get(`${baseUrl}/total-usuarios`),
          axios.get(`${baseUrl}/total-agendamentos`),
          axios.get(`${baseUrl}/total-categorias`),
          axios.get(`${baseUrl}/total-servicos`)
        ]);

        setStats({
          usuarios: usuarios.data.total,
          agendamentos: agendamentos.data.total,
          categorias: categorias.data.total,
          servicos: servicos.data.total
        });
        
        setError(null);
      } catch (err) {
        setError("Erro ao buscar dados");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const StatCard = ({ icon, title, value, description }) => (
    <View style={styles.card}>
      <MaterialIcons name={icon} size={28} color="#6a11cb" />
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardValue}>{value}</Text>
      <Text style={styles.cardDescription}>{description}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <MaterialIcons name="analytics" size={32} color="#6a11cb" />
          <Text style={styles.headerTitle}>Estatísticas do Sistema</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#6a11cb" style={styles.loader} />
        ) : error ? (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={28} color="#ff5252" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <>
            <StatCard
              icon="people"
              title="Total de Usuários"
              value={stats.usuarios}
              description="Usuários cadastrados"
            />
            
            <StatCard
              icon="event"
              title="Total de Agendamentos"
              value={stats.agendamentos}
              description="Agendamentos realizados"
            />
            
            <StatCard
              icon="category"
              title="Total de Categorias"
              value={stats.categorias}
              description="Categorias disponíveis"
            />
            
            <StatCard
              icon="miscellaneous-services"
              title="Total de Serviços"
              value={stats.servicos}
              description="Serviços oferecidos"
            />
          </>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Atualizado em: {new Date().toLocaleDateString()}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 24,
    color: '#333',
    fontWeight: 'bold',
    marginTop: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    marginBottom: 5,
  },
  cardValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 5,
  },
  cardDescription: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#ff5252',
    fontSize: 16,
    marginTop: 10,
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#999',
    fontSize: 12,
  },
  loader: {
    marginVertical: 40,
  },
});