// ECMAScript 6
// const, let
// template literals `string`
// spread operators { ...objeto } - [ ...array ]

// shorthand { a() } ex: 
    // const UserController = {
        // index () {} <- modo shorthand
    //}

    // arrow function () => {}


// class é tipo um molde do objeto, class é um contrutor de objeto
//class UserController {
//    registerForm(req, res) {
//        return res.redirect('/products')
//    }
//}

//module.exports = new UserController();


//================================================================

const User = require('../models/User')
const { formatCep, formatCpfCnpj } = require('../../lib/utils')

module.exports = {
    registerForm(req, res) {

        return res.render('user/register')
    },

    async show(req, res) {
        
        //pegando no req, após ter mandado no show do user.js
        const { user } = req

        user.cpf_cnpj = formatCpfCnpj(user.cpf_cnpj)
        user.cep = formatCep(user.cep)


        return res.render('user/index', {user})
    },

    async post(req, res) {
        
        const userId = await User.create(req.body)

        /* depois de configurada a session e colocada no server.js, agora temos disponível
           ela no req. o userId será uma chave
        */
        req.session.userId = userId

        return res.redirect('/users')
    },

    async update (req, res) {
        try {
            const { user } = req;

            let { name, email, cpf_cnpj, cep, address } = req.body;

            cpf_cnpj = cpf_cnpj.replace(/\D/g, "")
            cep = cep.replace(/\D/g, "")

            await User.update(user.id, {
                name,
                email,
                cpf_cnpj,
                cep,
                address
            })

            return res.render('user/index', {
                user: req.body,
                success: 'Conta atualizada com sucesso!'
            })

        } catch (err) {
            console.log(err)
            return res.render('user/index', {
                error: "Algo deu errado!"
            } )
        }
    },

    async delete (req, res) {
        try {

            await User.delete(req.body.id)
            req.session.destroy()//tirando da sessão

            return res.render('session/login', {
                success: 'Conta deletada com sucesso!'
            })

        } catch(err) {
            console.log(err)
            return res.send('user/index', {
                user: req.body,
                error: "Erro ao tentar deletar sua conta!"
            })
        }
    }
}











