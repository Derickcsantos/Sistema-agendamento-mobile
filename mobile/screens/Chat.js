import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function Chat({ route }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [otherUser, setOtherUser] = useState(null);
  const ws = useRef(null);
  const scrollViewRef = useRef();

  // Dados do usuário atual
  const currentUser = {
    id: route.params?.userId,
    name: route.params?.username
  };

  const setupWebSocket = () => {
    if (ws.current) {
      ws.current.close();
    }

    // Substitua pelo IP do seu servidor
    ws.current = new WebSocket('ws://192.168.56.1:3000');
    
    ws.current.onopen = () => {
      console.log('Conectado ao WebSocket');
      setIsConnected(true);
      setIsLoading(false);
      
      // Envia mensagem de identificação
      ws.current.send(JSON.stringify({
        type: 'identification',
        userId: currentUser.id,
        userName: currentUser.name
      }));
      
      // Carrega o outro usuário (você pode obter isso da sua API)
      loadOtherUser();
    };

    ws.current.onmessage = (e) => {
      const message = JSON.parse(e.data);
      
      if (message.type === 'identification') {
        // Atualiza os dados do outro usuário quando ele se conecta
        if (message.userId !== currentUser.id) {
          setOtherUser({
            id: message.userId,
            name: message.userName
          });
        }
      } 
      else if (message.type === 'message') {
        // Adiciona a mensagem recebida
        setMessages(prev => [...prev, {
          ...message,
          sender: message.senderId === currentUser.id ? 'me' : 'other',
          senderName: message.senderId === currentUser.id ? currentUser.name : (otherUser?.name || 'Usuário')
        }]);
      }
    };

    ws.current.onerror = (e) => {
      console.log('Erro no WebSocket:', e.message);
      setIsConnected(false);
    };

    ws.current.onclose = (e) => {
      console.log('Conexão WebSocket fechada:', e.code, e.reason);
      setIsConnected(false);
      setTimeout(() => setupWebSocket(), 5000);
    };
  };

  const loadOtherUser = async () => {
    try {
      // Substitua por sua chamada à API para obter o outro usuário
      // Exemplo: buscar o profissional/cliente associado a este chat
      const response = await fetch(`http://192.168.56.1:3000/get-other-user?userId=${currentUser.id}`);
      const data = await response.json();
      setOtherUser(data);
    } catch (error) {
      console.error('Erro ao carregar outro usuário:', error);
    }
  };

  const loadMessageHistory = async () => {
    if (!otherUser) return;
    
    try {
      const response = await fetch(
        `http://192.168.56.1:3000/chat-messages?user1=${currentUser.id}&user2=${otherUser.id}`
      );
      const data = await response.json();
      
      setMessages(data.map(msg => ({
        ...msg,
        sender: msg.sender_id === currentUser.id ? 'me' : 'other',
        senderName: msg.sender_id === currentUser.id ? currentUser.name : otherUser.name,
        timestamp: msg.created_at
      })));
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const handleSend = () => {
    if (inputText.trim() && ws.current && isConnected && otherUser) {
      const newMessage = {
        type: 'message',
        text: inputText,
        senderId: currentUser.id,
        senderName: currentUser.name,
        recipientId: otherUser.id,
        room: 'default',
        timestamp: new Date().toISOString()
      };
      
      ws.current.send(JSON.stringify(newMessage));
      
      // Adiciona localmente para feedback imediato
      setMessages(prev => [...prev, {
        ...newMessage,
        sender: 'me'
      }]);
      
      setInputText('');
    }
  };

  const scrollToBottom = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  };

  useEffect(() => {
    setupWebSocket();
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (otherUser) {
      loadMessageHistory();
    }
  }, [otherUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6a11cb" />
        <Text style={styles.loadingText}>Conectando ao chat...</Text>
      </View>
    );
  }

  if (!isConnected) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={48} color="#ff5252" />
        <Text style={styles.errorText}>Conexão perdida. Tentando reconectar...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <View style={styles.chatHeader}>
        <Text style={styles.chatTitle}>Chat com {otherUser?.name || '...'}</Text>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.messagesContainer}
        onContentSizeChange={scrollToBottom}
      >
        {messages.map((message, index) => (
          <View 
            key={`${message.id || index}_${message.timestamp || Date.now()}`}
            style={[
              styles.messageBubble, 
              message.sender === 'me' ? styles.myMessage : styles.otherMessage
            ]}
          >
            {message.sender !== 'me' && (
              <Text style={styles.senderName}>{message.senderName}</Text>
            )}
            <Text style={[
              styles.messageText,
              message.sender === 'me' ? styles.myMessageText : styles.otherMessageText
            ]}>
              {message.text}
            </Text>
            <Text style={[
              styles.timestamp,
              message.sender === 'me' ? styles.myTimestamp : styles.otherTimestamp
            ]}>
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Digite sua mensagem..."
          placeholderTextColor="#999"
          multiline
        />
        <TouchableOpacity 
          style={[
            styles.sendButton, 
            !inputText.trim() && styles.sendButtonDisabled
          ]} 
          onPress={handleSend}
          disabled={!inputText.trim()}
        >
          <MaterialIcons name="send" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  chatHeader: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  errorText: {
    marginTop: 10,
    color: '#ff5252',
    fontSize: 16,
  },
  messagesContainer: {
    padding: 15,
    paddingBottom: 80,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#6a11cb',
    borderTopRightRadius: 3,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderTopLeftRadius: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  senderName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontWeight: 'bold',
  },
  messageText: {
    fontSize: 16,
  },
  myMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: '#333',
  },
  timestamp: {
    fontSize: 10,
    marginTop: 5,
    textAlign: 'right',
  },
  myTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherTimestamp: {
    color: 'rgba(0, 0, 0, 0.5)',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#6a11cb',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});