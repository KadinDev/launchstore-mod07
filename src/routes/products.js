const express = require('express');
const routes = express.Router();
const multer = require('../app/middlewares/multer');

const ProductController = require('../app/controllers/ProductController');
const SearchController = require('../app/controllers/SearchController');

//configuração para redirecionar caso o user não esteja logado
//não terá permissão para criar produto
const { onlyUsers } = require('../app/middlewares/session');

// Search - coloca antes dos de baixo para poder funcionar corretamente
routes.get('/search', SearchController.index );

// Products
routes.get('/create', onlyUsers, ProductController.create );
routes.get('/:id', ProductController.show );
routes.get('/:id/edit',  onlyUsers, ProductController.edit );

routes.post('/', onlyUsers, multer.array('photos', 6), ProductController.post );
routes.put('/', onlyUsers, multer.array('photos', 6), ProductController.put );
routes.delete('/', onlyUsers, ProductController.delete );

module.exports = routes;