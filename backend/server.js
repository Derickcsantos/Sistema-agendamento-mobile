const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();
const WebSocket = require('ws');

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Configuração do servidor HTTP
const PORT = 3000;
const server = app.listen(PORT, () => console.log(`Servidor HTTP rodando na porta ${PORT}`));

// Configuração do WebSocket Server
const wss = new WebSocket.Server({ server });

// Armazenar conexões ativas
const clients = new Set();

wss.on('connection', (ws) => {
  console.log('Novo cliente conectado');
  
  // Inicializa o objeto userData para este cliente
  ws.userData = {
    userId: null,
    userName: null
  };

  clients.add(ws);

  ws.on('message', (message) => {
    try {
      const parsedMessage = JSON.parse(message);
      
      // Se for mensagem de identificação
      if (parsedMessage.type === 'identification') {
        ws.userData.userId = parsedMessage.userId;
        ws.userData.userName = parsedMessage.userName;
        console.log(`Usuário identificado: ${parsedMessage.userName} (ID: ${parsedMessage.userId})`);
        return;
      }
      
      // Se for mensagem normal
      if (parsedMessage.type === 'message') {
        // Verifica se o usuário está identificado
        if (!ws.userData.userId) {
          console.warn('Mensagem recebida de usuário não identificado');
          return;
        }
        
        const messageToSend = {
          ...parsedMessage,
          senderId: ws.userData.userId,
          senderName: ws.userData.userName,
          timestamp: new Date().toISOString(),
          type: 'message'
        };
        
        // Envia para todos os clientes conectados
        wss.clients.forEach(client => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(messageToSend));
          }
        });

        // Salva no banco de dados
        saveMessageToDatabase(messageToSend);
      }
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Erro ao processar sua mensagem'
      }));
    }
  });

  ws.on('close', () => {
    if (ws.userData.userId) {
      console.log(`Usuário ${ws.userData.userName} (ID: ${ws.userData.userId}) desconectado`);
    } else {
      console.log('Cliente não identificado desconectado');
    }
    clients.delete(ws);
  });

  ws.on('error', (error) => {
    console.error('Erro na conexão WebSocket:', error);
    if (ws.userData.userId) {
      clients.delete(ws.userData.userId);
    }
  });
});

async function saveMessageToDatabase(message) {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert([
        {
          sender_id: message.senderId,
          sender_name: message.senderName,
          content: message.text,
          recipient_id: message.recipientId,
          room: message.room || 'default'
        }
      ]);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao salvar mensagem no banco:', error);
    throw error;
  }
}

// Middleware para validação de dados do usuário
const validateUserData = (req, res, next) => {
  const { username, email } = req.body;
  
  if (!username || username.length < 3) {
    return res.status(400).json({ error: 'Nome de usuário deve ter pelo menos 3 caracteres' });
  }
  
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'E-mail inválido' });
  }
  
  next();
};

// Rotas de autenticação
app.post("/cadastro", validateUserData, async (req, res) => {
  const { username, email, dataNascimento, senha } = req.body;
  
  try {
    // Verifica se o usuário já existe
    const { data: existingUser, error: existingError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'E-mail já cadastrado' });
    }

    const { data, error } = await supabase
      .from("users")
      .insert([
        { 
          username, 
          email, 
          aniversario: dataNascimento, 
          password_plaintext: senha 
        }
      ])
      .select('id, username, email, aniversario')
      .single();

    if (error) throw error;
    res.json({ sucesso: true, usuario: data });
  } catch (error) {
    console.error('Erro no cadastro:', error);
    res.status(500).json({ error: 'Erro ao cadastrar usuário' });
  }
});

app.post("/login", async (req, res) => {
  const { email, senha } = req.body;
  
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .eq("password_plaintext", senha)
      .single();
      
    if (error || !data) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }
    
    res.json({ 
      sucesso: true, 
      usuario: {
        id: data.id,
        username: data.username,
        email: data.email,
        aniversario: data.aniversario
      } 
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro ao realizar login' });
  }
});

// Rotas de dados do usuário
app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('users')
      .select('id, username, email, aniversario, created_at')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Usuário não encontrado' });
    
    res.json(data);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

app.put('/api/users/:id', validateUserData, async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, password_plaintext } = req.body;

    const updateData = {
      username,
      email,
      updated_at: new Date().toISOString(),
      ...(password_plaintext && { password_plaintext })
    };

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select('id, username, email, aniversario')
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// Rotas de estatísticas
app.get("/total-usuarios", async (req, res) => {
  try {
    const { count, error } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });
    
    if (error) throw error;
    res.json({ total: count });
  } catch (error) {
    console.error('Erro ao contar usuários:', error);
    res.status(500).json({ error: 'Erro ao contar usuários' });
  }
});

app.get("/total-agendamentos", async (req, res) => {
  try {
    const { count, error } = await supabase
      .from("appointments")
      .select("*", { count: "exact", head: true });
    
    if (error) throw error;
    res.json({ total: count });
  } catch (error) {
    console.error('Erro ao contar agendamentos:', error);
    res.status(500).json({ error: 'Erro ao contar agendamentos' });
  }
});

app.get("/total-categorias", async (req, res) => {
  try {
    const { count, error } = await supabase
      .from("categories")
      .select("*", { count: "exact", head: true });
    
    if (error) throw error;
    res.json({ total: count });
  } catch (error) {
    console.error('Erro ao contar categorias:', error);
    res.status(500).json({ error: 'Erro ao contar categorias' });
  }
});

app.get("/total-servicos", async (req, res) => {
  try {
    const { count, error } = await supabase
      .from("services")
      .select("*", { count: "exact", head: true });
    
    if (error) throw error;
    res.json({ total: count });
  } catch (error) {
    console.error('Erro ao contar serviços:', error);
    res.status(500).json({ error: 'Erro ao contar serviços' });
  }
});

// Rotas de chat
app.get("/chat-messages", async (req, res) => {
  const { user1, user2 } = req.query;
  
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .or(`and(sender_id.eq.${user1},recipient_id.eq.${user2}),and(sender_id.eq.${user2},recipient_id.eq.${user1})`)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Erro ao buscar mensagens:', error);
    res.status(500).json({ error: 'Erro ao carregar mensagens' });
  }
});

// Middleware para tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({ error: 'Ocorreu um erro inesperado' });
});