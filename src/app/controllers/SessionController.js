// Esse SessionController está na routes de login

const User = require('../models/User');

const { hash } = require('bcryptjs');
const crypto = require('crypto');
const mailer = require('../../lib/mailer');

module.exports = {
    loginForm(req, res) {
        return res.render('session/login')
    },
    
    login(req, res) {
        req.session.userId = req.user.id;

        return res.redirect('/users')
    },

    // para deslogar
    logout(req, res) {
        req.session.destroy();
        return res.redirect('/')
    },
    

    //começando a parte de recuperar a senha
    forgotForm(req, res) {
        return res.render('session/forgot-password')
    },

    async forgot(req, res) {
        const user = req.user //pegando do session.js linha 53

        try {

            // um token para esse usuário
            // criando um token com crypto
            const token = crypto.randomBytes(20).toString('hex');

            // criar uma expiração do token
            let now = new Date();
            //terá 1 hora para expirar o token
            now = now.setHours(now.getHours() + 1 )

            await User.update(user.id, {
                reset_token: token,
                reset_token_expires: now,
            })


            // enviar um email com um link de recuperação de senha
            await mailer.sendMail({
                to: user.email,
                from: 'no-reply@launchstore.com.br',
                subject: 'Recuperação de senha',
                html: `
                    <h2> Perdeu a chave? </h2>
                    <p> Não se preocupe ${user.name}, clique no link abaixo para recuperar sua senha </p>
                    <p>
                        <a href="http://localhost:3000/users/password-reset?token=${token}" target="_blank">
                        RECUPERAR SENHA
                        </a>
                    </p>
                    `
            })


            // avisar o usuário que enviamos o email
            return res.render('session/forgot-password', {
                success: "Verifique seu email para resetar sua senha!"
            })

        } catch(err) {
            console.error(err)
            return res.render('session/forgot-password', {
                error: "Error inesperado, tente novamente!"
            })
        }
    },

    resetForm(req, res) {
        //e aqui pego o token que veio pelo link enviado para o email
        return res.render('session/password-reset', {token: req.query.token} )
    },

    async reset(req, res) {
        const user = req.user

        const { password, token } = req.body;

        try {
            //cria novo hash de senha
            const newPassword = await hash(password, 8)

            //atualiza usuário
            await User.update(user.id, {
                password: newPassword,
                reset_token: "",
                reset_token_expires: "",
            })

            
            await mailer.sendMail({
                to: user.email,
                from: 'no-reply@launchstore.com.br',
                subject: 'Nova Senha',
                html: `
                    <h2> Muito Bem, ${user.name}! </h2>
                    <p> Sua senha foi atualizada com sucesso! :D </p>
                    `
            })
            

            //avisa usuário que ele tem uma nova senha
            return res.render('session/login', {
                user: req.body,
                success: 'Senha atualizada com sucesso, faça seu login'
            })

            

        } catch(err) {
            console.error(err)
            return res.render('session/password-reset', {
                user: req.body, //caso tenha erro, os campos continuam preenchidos
                token, //não perde o token se a página da erro e atualiza
                error: "Error inesperado, tente novamente!"
            })
        }
    }
}