const express = require('express');
const routes = express.Router();

const HomeController = require('../app/controllers/HomeController');

const products = require('./products');
const users = require('./users');

routes.get('/', HomeController.index );

// mesma ideia dos users abaixo
routes.use('/products', products);

// aqui exporto o users, ele vai exportar adicionando /users na frente
routes.use('/users', users)
// vai adicionar em todos as rotas exportadas em users


// Alias = significa atalhos
routes.get('/ads/create', function( req, res ){
    return res.redirect('/products/create')
});

routes.get('/accounts', function(req, res) {
    return res.redirect('/users/login')
})

module.exports = routes;