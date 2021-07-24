const multer = require('multer')


const storage = multer.diskStorage({
    destination: (req, file, cb) => { // cb = callback
        // 1º params null, 2° params o destino onde salvará os files
        cb(null, './public/images' )
    },

    filename: (req, file, cb) => {
        // uma data como string, que é o dia e hora do file enviado
        // e coloca o nome original do file enviado
        cb(null, `${Date.now().toString()}-${file.originalname}` )
    }
})

const fileFilter = (req, file, cb) => {
    // tipos de images que aceitará
    const isAccepted = [ 'image/png', 'image/jpg', 'image/jpeg' ]
    // para cada um fará um find 
    // file.mimetype - o file que estou recebendo do multer( o file acima), o tipo do file.
    .find(acceptedFormat => acceptedFormat == file.mimetype )

    if(isAccepted) {
        return cb(null, true); // o calback espera que seja true ou false
    }

    // se não ...
    return cb(null, false)
}

module.exports = multer({
    storage,
    fileFilter,
})