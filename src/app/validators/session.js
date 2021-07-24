// AQUI É ONDE COLOCARÁ O USUÁRIO LOGADO
// Esse session está na routes de login, antes do SessionController.login

const User = require('../models/User');

const { compare } = require('bcryptjs'); // descriptografar senhas dos users


// next, tipo ir para o próximo passo
async function login (req, res, next) {

    //entrando na parte de login
    const { email, password } = req.body

    //verificar se o usuário está cadastrado
    //aqui vai procurar por email, procurar o user com o email
    const user = await User.findOne({where: {email} })

    if(!user) return res.render('session/login', {
        user: req.body, //vai manter o campo de email preenchido
        error: "Usuário não cadastrado!"
    })

    //verificar se a senha confere
    const passed = await compare(password, user.password)

    if(!passed) return res.render('session/login', {
        user: req.body, //vai manter o campo de email preenchido
        error: 'Senha incorreta.'
    })


    //quando tudo estiver OK mandará o user para o próximo passo (next())
    req.user = user
    next();
}


// verificando se o email já existe para fazer a recuperação de senha
async function forgot(req, res, next){
    
    const { email } = req.body

    try {
        let user = await User.findOne({ where: { email }}) //pega email

        if(!user) return res.render('session/forgot-password', {
            user: req.body,
            error: "Email não cadastrado!"
        })


        req.user = user //coloquei aqui para fazer funcionar no forgot do SessionController

        next()

    } catch {
        console.log(err)
    }
    
    
}

async function reset(req, res, next) {
    // procurar usuário

    //entrando na parte de login
    const { email, password, token, passwordRepeat } = req.body

    //verificar se o usuário está cadastrado
    //aqui vai procurar por email, procurar o user com o email
    const user = await User.findOne({where: {email} })

    if(!user) return res.render('session/password-reset', {
        user: req.body, //vai manter o campo de email preenchido
        token, // manter o token junto para não perder ele, para não precisar
        //clicar no lindo do email novamente
        error: "Usuário não cadastrado!"
    })


    //ver se a senha bate
    
    // verificar se a senha e repetição de senha estão iguais
    if (password != passwordRepeat) 
        return res.render('session/password-reset', {
            user: req.body,
            token, // manter o token junto para não perder ele, para não precisar
            //clicar no lindo do email novamente
            error: 'A senha e a repetição da senha estão incorretas'
    })


    //verificar se o token bate
    if (token != user.reset_token) return res.render('session/password-reset', {
        user: req.body,
        token,
        error: 'Token inválido, solicite uma nova recuperação de senha!'
    })


    //verificar se o token não expirou
    let now = new Date() //nova hora
    now = now.setHours(now.getHours()) //hora atual

    // se a hora definida passou, o token expirou
    if (now > user.reset_token_expires) return res.render('session/password-reset', {
        user: req.body,
        token,
        error: 'Token expirado! Por favor, solicite uma nova recuperação de senha!'
    })

    req.user = user
    next()

}

module.exports = {
    login,
    forgot,
    reset
}