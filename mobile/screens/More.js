import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function More() {
  const [animation] = useState(new Animated.Value(0));
  const [expanded, setExpanded] = useState(false);

  const toggleAnimation = () => {
    Animated.spring(animation, {
      toValue: expanded ? 0 : 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
    setExpanded(!expanded);
  };

  const rotateInterpolate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  const scaleInterpolate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mais Opções</Text>
      
      <TouchableOpacity onPress={toggleAnimation} style={styles.animatedButton}>
        <Animated.View style={[styles.animatedIcon, { transform: [{ rotate: rotateInterpolate }, { scale: scaleInterpolate }] }]}>
          <MaterialIcons name="add" size={32} color="#6a11cb" />
        </Animated.View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.optionsContainer}>
          <View style={styles.option}>
            <MaterialIcons name="settings" size={24} color="#6a11cb" />
            <Text style={styles.optionText}>Configurações</Text>
          </View>
          <View style={styles.option}>
            <MaterialIcons name="help-outline" size={24} color="#6a11cb" />
            <Text style={styles.optionText}>Ajuda</Text>
          </View>
          <View style={styles.option}>
            <MaterialIcons name="info-outline" size={24} color="#6a11cb" />
            <Text style={styles.optionText}>Sobre</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  animatedButton: {
    alignItems: 'center',
    marginBottom: 20,
  },
  animatedIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  optionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#333',
  },
});