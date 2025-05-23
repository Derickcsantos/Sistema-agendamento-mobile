const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Cadastro
app.post("/cadastro", async (req, res) => {
  const { username, email, senha } = req.body;
  const { data, error } = await supabase.from("users").insert([
    { username, email, password_plaintext: senha }
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

const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
