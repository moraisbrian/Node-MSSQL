const express = require('express');
const app = express();         
const bodyParser = require('body-parser');
const port = 3000;
const sql = require('mssql');
const connStr = "Server=(local)\\sqlexpress;Database=Node_MSSQL;User Id=sa;Password=admin;";

//fazendo a conexão global
sql.connect(connStr)
   .then(conn => global.conn = conn)
   .catch(err => console.log(err));

//configurando o body parser para pegar POSTS
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//definindo as rotas
const router = express.Router();
router.get('/', (req, res) => res.json({ message: 'Funcionando!' }));

router.get('/clientes', (req, res) =>{
    execSQLQuery('SELECT * FROM Clientes', res);
});

router.get('/clientes/:id?', (req, res) =>{
    let filter = '';
    if(req.params.id) filter = ' WHERE ID=' + parseInt(req.params.id);
    execSQLQuery('SELECT * FROM Clientes' + filter, res);
});

router.delete('/clientes/:id', (req, res) =>{
    execSQLQuery('DELETE Clientes WHERE ID=' + parseInt(req.params.id), res);
});

router.post('/clientes', (req, res) =>{
    const id = parseInt(req.body.id);
    const nome = req.body.nome.substring(0,150);
    const cpf = req.body.cpf.substring(0,11);
    execSQLQuery(`INSERT INTO Clientes(ID, Nome, CPF) VALUES(${id},'${nome}','${cpf}')`, res);
});

router.patch('/clientes/:id', (req, res) =>{
    const id = parseInt(req.params.id);
    const nome = req.body.nome.substring(0,150);
    const cpf = req.body.cpf.substring(0,11);
    execSQLQuery(`UPDATE Clientes SET Nome='${nome}', CPF='${cpf}' WHERE ID=${id}`, res);
});

app.use('/', router);

function execSQLQuery(sqlQry, res){
    global.conn.request()
               .query(sqlQry)
               .then(result => res.json(result.recordset))
               .catch(err => res.json(err));
}

//Executando muitas operações SQL (exemplo)
function execute(items, i, conn){
    if(!items[i]) return console.log("terminou");

    conn.request()
        .query(`DELETE Usuario WHERE email='${items[i]}'`)
        .then(result => {
            console.log(result)
            execute(items, ++i, conn)//faz o próximo
        })
        .catch(err => console.log(err));
}

//inicia o servidor
app.listen(port);
console.log('API funcionando!');
