function onlyUsers(req, res, next) {
    
    // se não existir o userId na sessão, significa que não está logado
    // e redireciona ele, ele não terá acesso para criar algum produto
    //quando clicar em Novo Anúncio, só terá permissão se estiver logado
    if(!req.session.userId)
    return res.redirect('/users/login')
    
    next();
}

/*quando estiver logado redireciona para users, quando logado e clicar em minha conta
vai redirecionar para o form de atualizar informações */
function isLoggedRedirectToUsers(req, res, next){
    if(req.session.userId)
    return res.redirect('/users')

    next();
}

module.exports = {
    onlyUsers,
    isLoggedRedirectToUsers
}