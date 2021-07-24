const db = require('../../config/db')

const fs = require('fs')

// criando a imagem
module.exports = {
    create({ filename, path, product_id }) {
        const query = `
            INSERT INTO files (
                name,
                path,
                product_id
            ) VALUES ( $1, $2, $3)
            RETURNING id
        `
        
        const values = [
            filename,
            path,
            product_id
        ]

        return db.query(query, values)
    },

    async delete(id) {


        try { /* se alguma coisa falhar ele vai capturar o erro
            e imprimir pra vc.
            
            somente tudo dando certo é que irá deletar do banco de dados
            */ 

            const result = await db.query(`SELECT * FROM files WHERE id = $1`, [id] )
            const file = result.rows[0]

            // antes de configurar o debug no vscode
            fs.unlinkSync(file.path)

            return db.query(`
            DELETE FROM files WHERE id = $1
            `, [id] )

            // depois de configurar o debug no vscode
            // pode ficar assim que funcionará tbm
            /*
            fs.unlink(file.path, (err) => {

                if (err) throw err

                return db.query(`
                DELETE FROM files WHERE id = $1
                `, [id])

            })
            */


        } catch (err) {
            console.error(err)
        }


        // selecione tudo dos id onde o id for igual ao id do file
        // como é promisse precisar usar await para esperar por ela,
        // e sempre no começo usa o async
        
        //const result = await db.query(`SELECT * FROM files WHERE id = $id`, [id] )

        //const file = result.rows[0]

        // esperar fazer sincronização
        // passando o caminho que quero que ela delete, o path é o caminho
        
        //fs.unlinkSync(file.path)

        
    }
}