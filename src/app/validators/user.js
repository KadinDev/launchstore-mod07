const User = require('../models/User');

const { compare } = require('bcryptjs'); // descriptografar senhas dos users

function checkAllFields(body){
    // colocando a verificação dos inputs como função
    const keys = Object.keys(body)

    for (key of keys) {
        if (body[key] == "" ) {
            return {
                user: body,
                error: 'Por favor preencha todos os campos'
            }
        }
    }

}


// next, tipo ir para o próximo passo
async function show (req, res, next) {
    // pegando do session o id do user
    const { userId: id } = req.session

    // onde o id for igual ao id procure um user
    const user = await User.findOne({where: {id} })

    if(!user) return res.render('user/register', {
        error: "Usuário não encontrado!"
    })

    // manda para o req, o user. e pega no UserController
    req.user = user

    next();
}

async function post(req, res, next) {
    // verificar se todos os campos estão cheios
    const fillAllFields = checkAllFields(req.body)
    if (fillAllFields){
        return res.render('user/register', fillAllFields)
    }

    // verificar se já existe [email, cpf_cnpj]
    let { email, cpf_cnpj, password, passwordRepeat } = req.body

    cpf_cnpj = cpf_cnpj.replace(/\D/g, "")

    // pesquisar no banco de dados
    const user = await User.findOne({ 
        where: { email },  
        or: { cpf_cnpj }
    })

    if (user) return res.render('user/register', {
        user: req.body, // para quando houver erro não limpar todos os inputs
        error: 'Usuário já cadastrado!'
    })


    // verificar se a senha e repetição de senha estão iguais
    if (password != passwordRepeat) 
        return res.render('user/register', {
            user: req.body,
            error: 'A senha e a repetição da senha estão incorretas'
    })

    next()
    // next é rodado no final se ele passar por todas as ideias
}

async function update(req, res, next) {
    // verificar se todos os campos estão cheios
    const fillAllFields = checkAllFields(req.body)
    if (fillAllFields){
        return res.render('user/index', fillAllFields)
    }

    const { id, password } = req.body

    // verificar se preencheu a senha
    if(!password) return res.render('user/index', {
        user: req.body,
        error: "Coloque sua senha para atualizar seu cadastro!"
    })

    // verificar se as senhas são iguais
    const user = await User.findOne({ where: {id} })

    const passed = await compare(password, user.password)

    if(!passed) return res.render('user/index', {
        user: req.body,
        error: 'Senha incorreta.'
    })


    req.user = user
    next();
    
}

module.exports = {
    post,
    show,
    update,
}