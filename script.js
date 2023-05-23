const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
app.use(express.json());

const dbConfig = {
  host: 'localhost',
  user: 'username',
  password: '',
  database: 'loja',
};

// Consulta de produtos disponíveis
app.get('/produtos', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM produtos');
    connection.end();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao consultar produtos.' });
  }
});

// Realização de um pedido
app.post('/pedidos', async (req, res) => {
  const { clienteId, produtos } = req.body;

  try {
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
      'INSERT INTO pedidos (horario, endereco, cliente_id) VALUES (CURRENT_TIMESTAMP(), ?, ?)',
      [req.body.endereco, clienteId]
    );
    const pedidoId = result.insertId;

    const promises = produtos.map(async (produto) => {
      const [result] = await connection.execute(
        'INSERT INTO pedidos_produtos (pedido_id, produto_id, preco, quantidade) VALUES (?, ?, ?, ?)',
        [pedidoId, produto.produtoId, produto.preco, produto.quantidade]
      );
      return result.insertId;
    });

    await Promise.all(promises);

    connection.end();

    res.json({ message: 'Pedido realizado com sucesso.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao realizar o pedido.' });
  }
});

// Consulta de pedidos realizados
app.get('/pedidos', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      'SELECT pedidos.id, pedidos.horario, pedidos.endereco, clientes.nome AS cliente_nome FROM pedidos JOIN clientes ON pedidos.cliente_id = clientes.id'
    );
    connection.end();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao consultar pedidos.' });
  }
});



// Cadastro de clientes
app.post('/clientes', async (req, res) => {
  
});


// Iniciar servidor
app.listen(3306, () => {
  console.log('Servidor iniciado na porta 3306');
});
