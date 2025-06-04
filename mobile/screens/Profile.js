import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function Profile({ route }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    aniversario: '',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
  });
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // ID do usuário logado (deveria vir das props ou do contexto de autenticação)
  const userId = route.params?.userId;

  // Busca os dados do usuário
  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://SEU_IP:3000/api/users/${userId}`);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setUserData({
        username: data.username,
        email: data.email,
        aniversario: data.aniversario || 'Não informado',
        avatar: data.avatar || 'https://randomuser.me/api/portraits/men/1.jpg'
      });

      setFormData({
        username: data.username,
        email: data.email,
        password: '',
        confirmPassword: ''
      });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os dados do usuário');
      console.error('Erro ao buscar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Atualiza os dados do usuário
  const updateUserData = async () => {
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    try {
      setIsUpdating(true);
      const response = await fetch(`http://SEU_IP:3000/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          ...(formData.password && { password_plaintext: formData.password })
        })
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setUserData(prev => ({
        ...prev,
        username: data.username,
        email: data.email
      }));

      Alert.alert('Sucesso', 'Dados atualizados com sucesso');
      setEditMode(false);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar os dados');
      console.error('Erro ao atualizar:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogout = () => {
    // Implemente sua lógica de logout aqui
    console.log('Usuário deslogado');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6a11cb" />
        <Text style={styles.loadingText}>Carregando perfil...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Image 
            source={{ uri: userData.avatar }} 
            style={styles.avatar}
            onError={() => setUserData(prev => ({...prev, avatar: 'https://via.placeholder.com/150'}))}
          />
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => setEditMode(!editMode)}
          >
            <MaterialIcons 
              name={editMode ? 'close' : 'edit'} 
              size={20} 
              color="#6a11cb" 
            />
          </TouchableOpacity>
        </View>
        
        {editMode ? (
          <>
            <TextInput
              style={styles.editInput}
              value={formData.username}
              onChangeText={(text) => handleInputChange('username', text)}
              placeholder="Nome de usuário"
            />
            <TextInput
              style={styles.editInput}
              value={formData.email}
              onChangeText={(text) => handleInputChange('email', text)}
              placeholder="E-mail"
              keyboardType="email-address"
            />
          </>
        ) : (
          <>
            <Text style={styles.name}>{userData.username}</Text>
            <Text style={styles.email}>{userData.email}</Text>
          </>
        )}
      </View>

      {editMode && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alterar Senha</Text>
          <TextInput
            style={styles.editInput}
            value={formData.password}
            onChangeText={(text) => handleInputChange('password', text)}
            placeholder="Nova senha"
            secureTextEntry
          />
          <TextInput
            style={styles.editInput}
            value={formData.confirmPassword}
            onChangeText={(text) => handleInputChange('confirmPassword', text)}
            placeholder="Confirmar nova senha"
            secureTextEntry
          />
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={updateUserData}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Salvar Alterações</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informações Pessoais</Text>
        <View style={styles.infoItem}>
          <MaterialIcons name="event" size={24} color="#6a11cb" />
          <Text style={styles.infoText}>
            Data de Nascimento: {userData.aniversario || 'Não informada'}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <MaterialIcons name="person" size={24} color="#6a11cb" />
          <Text style={styles.infoText}>
            ID do Usuário: {userId}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configurações</Text>
        <TouchableOpacity style={styles.settingItem}>
          <MaterialIcons name="notifications" size={24} color="#6a11cb" />
          <Text style={styles.settingText}>Notificações</Text>
          <MaterialIcons name="chevron-right" size={24} color="#999" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <MaterialIcons name="security" size={24} color="#6a11cb" />
          <Text style={styles.settingText}>Privacidade</Text>
          <MaterialIcons name="chevron-right" size={24} color="#999" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <MaterialIcons name="help-outline" size={24} color="#6a11cb" />
          <Text style={styles.settingText}>Ajuda</Text>
          <MaterialIcons name="chevron-right" size={24} color="#999" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ddd',
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  editInput: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  section: {
    marginBottom: 25,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#6a11cb',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#ff5252',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});