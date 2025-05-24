import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function HomePage() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bem-vindo ao TimeCut</Text>
        <Text style={styles.subtitle}>Sistema de agendamento online</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Agendamentos</Text>
        <View style={styles.card}>
          <MaterialIcons name="event-available" size={24} color="#6a11cb" />
          <Text style={styles.cardText}>Novo Agendamento</Text>
        </View>
        <View style={styles.card}>
          <MaterialIcons name="list-alt" size={24} color="#6a11cb" />
          <Text style={styles.cardText}>Meus Agendamentos</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Serviços Populares</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.serviceCard}>
            <MaterialIcons name="cut" size={24} color="#6a11cb" />
            <Text style={styles.serviceText}>Corte de Cabelo</Text>
          </View>
          <View style={styles.serviceCard}>
            <MaterialIcons name="color-lens" size={24} color="#6a11cb" />
            <Text style={styles.serviceText}>Coloração</Text>
          </View>
          <View style={styles.serviceCard}>
            <MaterialIcons name="spa" size={24} color="#6a11cb" />
            <Text style={styles.serviceText}>Tratamentos</Text>
          </View>
        </ScrollView>
      </View>

      <View style={styles.promoSection}>
        <Text style={styles.promoTitle}>Promoções Especiais</Text>
        <View style={styles.promoCard}>
          <Text style={styles.promoText}>20% OFF no primeiro agendamento</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  serviceCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginRight: 10,
    alignItems: 'center',
    width: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  serviceText: {
    marginTop: 5,
    fontSize: 14,
    textAlign: 'center',
  },
  promoSection: {
    marginTop: 20,
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  promoCard: {
    backgroundColor: '#6a11cb',
    padding: 15,
    borderRadius: 10,
  },
  promoText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});