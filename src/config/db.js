
// Criar uma const que vai desestruturar do require pg, o Pool
// Pool, faz uma configuração e conecta ele somente uma vez no banco, para não
// ficar precisando colocar login e senha no banco
const { Pool } = require('pg')


module.exports = new Pool({
    user: 'postgres',
    password: '159753',
    host: 'localhost',
    database: 'launchstore',
    port: 5432
})