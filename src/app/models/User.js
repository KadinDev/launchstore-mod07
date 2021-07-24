const db = require('../../config/db');

const { hash } = require('bcryptjs'); // criptografando senha
//const { update } = require('../controllers/UserController');

const fs = require('fs'); // fs o file system

const Product = require('../models/Product');

module.exports = {

    async findOne(filters){
        let query = "SELECT * FROM users"

        // o map vai rodar para as duas chaves, o where e o or
        Object.keys(filters).map(key => {
            // WHERE | OR | AND
            query = `
                ${query}
                ${key}
            `

            // essa é para o email, o or que está em UserController line 49
            Object.keys(filters[key]).map(field => {
                query = ` ${query} ${field} = '${filters[key][field]}'
                `
            })
        })

        const results = await db.query(query)

        return results.rows[0] // 0 por que estou procurando um só
    },

    async create(data) {
        // try catch para vermos o erro caso tenha
        try {
            const query = `
            INSERT INTO users (
                name,
                email,
                password,
                cpf_cnpj,
                cep,
                address
            ) VALUES ( $1, $2, $3, $4, $5, $6 )
            RETURNING id
            `
        
            // fazer criptografia de senha
            // npm install bcryptjs
            // hash é uma function, primeiro recebe o password
            // e segundo é a força (8)
            const passwordHash = await hash(data.password, 8)
            // a força a gnt escolhe, 8 é uma perfeita opção


            const values = [
                data.name,
                data.email,
                passwordHash,
                data.cpf_cnpj.replace(/\D/g, ""), // replace para levar só os números
                data.cep.replace(/\D/g, ""),
                data.address
            ]

            const results = await db.query(query, values)

            return results.rows[0].id
        
        } catch (err) {
            console.error(err)
        }
        
    },

    // coloquei o id e o nome fields eu que dei
    async update(id, fields) {
        let query = "UPDATE users SET"

        Object.keys(fields).map((key, index, array) => {
            // aqui é aquela ideia para saber se está no último ou não,
            // para ver se a questão da vírgula, como no create
            //ex: cpf_cnpj,
                //cep,
                //address   <- o último nunca terá a vírgula
            // a ideia abaixo é para verificar isso
            if ( (index + 1) < array.length) {
                // a key no inicio é a chave, que é o name
                // '${fields[key]}',  <- e coloca a vírgula ,
                query = `${query}
                    ${key} = '${fields[key]}',
                `
            } else {
                // aqui a parte onde não terá a vírgula
                // ${key} = '${fields[key]}' <- aqui já termina sem a vírgula (,)
                query = `${query}
                    ${key} = '${fields[key]}'
                    WHERE id = ${id}
                `
            }
        })

        await db.query(query)
        return
    },

    async delete(id) {
        // pegar todos os produtos
        let results = await db.query("SELECT * FROM products WHERE user_id = $1", [id])
        const products = results.rows
    
        // pegar todas as imagens
        const allFilesPromises = products.map(product => 
            Product.files(product.id))

        let promiseResults = await Promise.all(allFilesPromises)

        // rodar a remoção do usuário
        // primeiro deletar antes de tirar os arquivos da pasta public
        await db.query('DELETE FROM users WHERE id = $1', [id])

        // remover as imagens da pasta public
        promiseResults.map(results => {
            results.rows.map(file => {
                try {
                    fs.unlinkSync(file.path)
                } catch(err) {
                    console.error(err)
                }
            })
        })

        
    }

}