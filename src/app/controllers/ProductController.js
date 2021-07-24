
const { formatPrice, date } = require('../../lib/utils')

const Category = require('../models/Category')
const Product = require('../models/Product')
const File = require('../models/File')

module.exports = {
    create(req, res){
        // Pegar Categorias
        Category.all()

        // then = então  // results = retornar com os resultados da busca dentro do Category.all
        // then faz parte do Promises = promessas
        .then(function(results) {

            const categories = results.rows // array de categorias que buscou no banco de dados

            return res.render('products/create.njk', { categories } )

        }).catch(function(err){ // catch para ver o erro do then / promises
            throw new Error(err)
        })
    },

    // para cada função que usar o await coloca o async no começo
    async post(req, res){
        // Lógica de Salvar
        // async await é a ideia de trabalhar com promisse sem fazer cadeia do .then

        const keys = Object.keys(req.body)

        for(key of keys){
            if(req.body[key] == ''){
                return res.send('Please, fill all fields')
            }
        }

        // se não tiver imagem
        if ( req.files.length == 0 ) return res.send('Please, send at least one image')

        //foi adicionado esse arquivo e tirado do Product o,  || 1 da line 34
        req.body.user_id = req.session.userId
        let results = await Product.create(req.body)
        const productId = results.rows[0].id

        // criando array de promessas
        // o map vai retornar um array              // aqui esta retornando uma promisse
        const filesPromise = req.files.map( file => File.create({ ...file, product_id: productId }) )

        // e passo o array de promises pro Promise.all
        // ele espera todas as promises serem executadas
        await Promise.all( filesPromise )

        return res.redirect(`/products/${productId}/edit`)

    },

    async show(req, res){
        
        let results = await Product.find(req.params.id) // pegar produto
        const product = results.rows[0]
        
        if(!product) return res.send('Product not found!')

        const { day, hour, minutes, month } = date(product.updated_at) // updated_at pega a hora atual

        product.published = { // data de publicação do produto
            day: `${day}/${month}`, // se deixar ${day - 1}, vai pegar da forma correta.
            hour: `${hour}h${minutes}`,
        }

        product.oldPrice = formatPrice(product.old_price)        
        product.price = formatPrice(product.price)

        // pegando as imagens para mostrar
        results = await Product.files(product.id)
        const files = results.rows.map(file => ({
            ... file,
            src: `${req.protocol}://${req.headers.host}${file.path.replace('public', '')}` 
        }) )

        return res.render('products/show', { product, files } )
    },

    async edit(req, res){

        // o await vai estar esperando essa promisse responder para continuar o programa
        // ao invés de estar entrando em cadeias .then, enviando callbacks para o pedido do banco de dados
        // utilizasse async await

        // let nessa vat para poder utilizar novamente abaixo
        
        let results = await Product.find(req.params.id)
        const product = results.rows[0]

        if (!product) return res.send('Product not found')

        product.price = formatPrice(product.price)
        product.old_price = formatPrice(product.old_price)

        results = await Category.all()
        const categories = results.rows


        
        // logica para pegar imagens enviadas e mostrar no edit
        results = await Product.files(product.id)
        
        // com map posso transformar um array em um novo array colocando alguma lógica, file =>
        let files = results.rows
        files = files.map(file => ({
            ...file, // espalhar o arquivo

            // req.protocol - se tiver http ou https ele pegam ambos
            // req.headers.host - o endereço completo do local
            src: `${req.protocol}://${req.headers.host}${file.path.replace('public', '')}`
        }) )

        return res.render('products/edit.njk', { product, categories, files })

    },

    async put(req, res){

        const keys = Object.keys(req.body)

        for (key of keys){
            if( req.body[key] == '' && key != "removed_files" ){
                return res.send('Please, fill all fields')
            }
        }


        // lógica para pegar as novas fotos no momento da edição
        if ( req.files.length != 0 ) {
            const newFilesPromise = req.files.map(file => 
                File.create( { ...file, product_id: req.body.id } ))

            await Promise.all(newFilesPromise)
        }


        if ( req.body.removed_files ) {
            // 1,2,3,
            const removedFiles = req.body.removed_files.split(",") // separar por , // aqui vai devolver um array [1,2,3, ]
            
            //remove end position do Array
            const lastIndex = removedFiles.length - 1

            // tira uma posição do lastIndex
            removedFiles.splice(lastIndex, 1) // [1,2,3]

            const removedFilesPromisse = removedFiles.map(id => File.delete(id))

            // await Promise.all, await ele espera. 
            //eu espero pelo removedFilesPromisse 
            await Promise.all(removedFilesPromisse)
        }



        req.body.price = req.body.price.replace(/\D/g, '' )
        // atualizando preço
        if ( req.body.old_price != req.body.price){
            // coloca const, e vou buscar(await) no Product.find o req.body.id
            const oldProduct = await Product.find(req.body.id)
            req.body.old_price = oldProduct.rows[0].price
        }

        await Product.update(req.body)

        return res.redirect(`/products/${req.body.id}`)

    },

    async delete(req, res){
        await Product.delete(req.body.id)

        return res.redirect('/products/create')
    }
}