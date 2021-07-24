// configura express, habilitando para funcionar o req.body
const { urlencoded } = require('express')

const express = require('express')
const nunjucks = require('nunjucks')
const routes = require('./routes')

// Necessário para os forms ( POST, PUT )
const methodOverride = require('method-override')
const server = express()


const session = require('./config/session')
server.use(session)

//esse locals cria uma variável, e estou chamando ela de session (res.locals.session)
server.use( (req, res, next) => {
    res.locals.session = req.session
    next()
})

// configura express, habilitando para funcionar o req.body
server.use(express.urlencoded({ extended: true }))

server.use(express.static('public'))

// method-override antes de routes, para ver as infos e enviar para as rotas
// Override = Sobrescrever
server.use(methodOverride('_method'))
server.use(routes)
server.set('view engine', 'njk')

nunjucks.configure('src/app/views', {
    express: server,
    autoescape: false,
    noCache: true
})

server.listen(1000, ()=> {
    console.log('Server Running')
})