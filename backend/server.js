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
  clients.add(ws);
  console.log('Novo cliente conectado');

  ws.on('message', (message) => {
    try {
      const parsedMessage = JSON.parse(message);
      
      // Se for mensagem de identificação
      if (parsedMessage.type === 'identification') {
        ws.userData.userId = parsedMessage.userId;
        ws.userData.userName = parsedMessage.userName;
        console.log(`Usuário identificado: ${parsedMessage.userName}`);
        return;
      }
      
      // Se for mensagem normal
      if (parsedMessage.type === 'message') {
        // Adiciona informações do remetente
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
    }
  });

  ws.on('close', () => {
    console.log(`Usuário ${ws.userData.userName} desconectado`);
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
          room: message.room || 'default'
        }
      ]);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao salvar mensagem no banco:', error);
  }
}
// Cadastro
app.post("/cadastro", async (req, res) => {
  const { username, email, dataNascimento, senha } = req.body;
  const { data, error } = await supabase.from("users").insert([
    { username, email, aniversario: dataNascimento, password_plaintext: senha }
  ]);
  if (error) return res.status(400).json({ erro: error.message });
  res.json({ sucesso: true });
});

// Login
app.post("/login", async (req, res) => {
  const { email, senha } = req.body;
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .eq("password_plaintext", senha)
    .single();
    
  if (error || !data) return res.status(401).json({ erro: "Credenciais inválidas" });
  res.json({ sucesso: true, usuario: data });
});

// Total de usuários
app.get("/total-usuarios", async (req, res) => {
  const { count, error } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true });
  if (error) return res.status(500).json({ erro: error.message });
  res.json({ total: count });
});

// Total de agendamentos
app.get("/total-agendamentos", async (req, res) => {
  const { count, error } = await supabase
    .from("appointments")
    .select("*", { count: "exact", head: true });
  if (error) return res.status(500).json({ erro: error.message });
  res.json({ total: count });
});

// Total de categorias
app.get("/total-categorias", async (req, res) => {
  const { count, error } = await supabase
    .from("categories")
    .select("*", { count: "exact", head: true });
  if (error) return res.status(500).json({ erro: error.message });
  res.json({ total: count });
});

// Total de serviços
app.get("/total-servicos", async (req, res) => {
  const { count, error } = await supabase
    .from("services")
    .select("*", { count: "exact", head: true });
  if (error) return res.status(500).json({ erro: error.message });
  res.json({ total: count });
});

// Histórico de mensagens entre dois usuários
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