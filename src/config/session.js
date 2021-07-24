// toda a configuração da sessão
const session = require('express-session');

// como retorna uma function já passa para dentro o (simple) para a função
const pgSession = require('connect-pg-simple')(session);

const db = require('./db');

module.exports = session({

    store: new pgSession({
        // trazendo o module.exports = new Pool de db.js
        pool: db
    }),
    // chave secreta
    secret: 'ricardo',
    
    // toda vez que fizer o load do aplicativo salva só uma vez
    resave: false,

    // não salvar a sessão sem ter dados, só salva quando estiver dados
    saveUninitialized: false,

    // define quanto tempo a sessão ficará salva no banco de dados
    cookie: {
        // 30 * 24 = 30 dias vezes 24 hrs
        // 30 * 24 * 60 = tantas hrs vezes 60 min
        // 30 * 24 * 60 * 60 = tantos min vezes 60 seg
        // 30 * 24 * 60 * 60 * 1000 = tantos segundos vezes milisegundos
        maxAge: 30 * 24 * 60 * 60 * 1000
    }

})