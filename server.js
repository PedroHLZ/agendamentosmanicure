const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();


app.use(express.json());
app.use(express.static('public'));

// Dados de exemplo: horários disponíveis
let horarios = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
let agendamentos = [];

// Função para carregar agendamentos de um arquivo JSON
function carregarAgendamentos() {
  try {
    const data = fs.readFileSync('dados.json', 'utf8');
    agendamentos = JSON.parse(data);
  } catch (err) {
    console.error('Erro ao carregar agendamentos:', err);
    agendamentos = [];
  }
}

// Função para salvar agendamentos em um arquivo JSON
function salvarAgendamentos() {
  try {
    fs.writeFileSync('dados.json', JSON.stringify(agendamentos, null, 2));
  } catch (err) {
    console.error('Erro ao salvar agendamentos:', err);
  }
}

// Carregar os agendamentos ao iniciar o servidor
carregarAgendamentos();

// Endpoint para obter horários disponíveis e agendamentos
app.get('/api/horarios', (req, res) => {
  res.json({ horarios: horarios, agendamentos: agendamentos });
});

// Endpoint para agendar um horário
app.post('/api/agendar', (req, res) => {
  const { horario, data, nome, servico } = req.body;

  if (!horario || !data || !nome || !servico) {
    return res.status(400).json({ message: 'Dados incompletos.' });
  }

  // Converter a data para o formato dd/mm/yyyy
  const [year, month, day] = data.split('-');
  const dataFormatada = `${day}/${month}/${year}`;

// Formata a data e o horário completo para comparação
const dataHoraFormatada = `${dataFormatada} ${horario}`;

// Verificar se o horário já está agendado para o mesmo dia e hora
const existeAgendamento = agendamentos.some((agendamento) => {
  const agendamentoDataHora = `${agendamento.data} ${agendamento.horario}`;
  return agendamentoDataHora === dataHoraFormatada;
});

  if (existeAgendamento) {
    return res.status(400).json({ message: 'Horário já agendado!' });
  
  }

  // Adicionar o novo agendamento
  agendamentos.push({ horario, data: dataFormatada, nome, servico });

  // Salvar os agendamentos no arquivo
  salvarAgendamentos();

  res.json({ message: 'Agendado com sucesso!' });
});

// Endpoint para cancelar um agendamento
app.delete('/api/cancelar', (req, res) => {
  const { horario, data } = req.query; // Usar req.query para obter parâmetros da URL

  if (!horario || !data) {
    return res.status(400).json({ message: 'Dados incompletos.' });
  }

  // Filtrar o agendamento para remover
  const agendamentoExistente = agendamentos.some(agendamento => agendamento.horario === horario && agendamento.data === data);

  if (!agendamentoExistente) {
    return res.status(400).json({ message: 'Agendamento não encontrado.' });
  }

  agendamentos = agendamentos.filter(agendamento => !(agendamento.horario === horario && agendamento.data === data));

  // Salvar os agendamentos no arquivo
  salvarAgendamentos();

  res.json({ message: 'Agendamento cancelado com sucesso!' });
});


app.put('/api/confirmar', (req, res) => {
  const { horario, data } = req.query;
  // Handle the confirmation logic here
  res.status(200).json({ message: 'Agendamento confirmado com sucesso.' });
});



// Endpoint para obter agendamentos por data
app.get('/api/horarios', (req, res) => {
    const { data } = req.query;
  
    if (data) {
      // Filtrar agendamentos pela data fornecida
      const agendamentosDia = agendamentos.filter(agendamento => agendamento.data === data);
      return res.json({ agendamentos: agendamentosDia });
    }
  
    res.json({ horarios: horarios, agendamentos: agendamentos });
  });
  
app.listen( () => {
  console.log(`Servidor rodando em https://agendamentosmanicure.onrender.com`);
});
