/*
const input = document.querySelector('input[name="price"]')

// keydown é o evento de toque no teclado
input.addEventListener('keydown', function(e){
    
    setTimeout(function(){
        let { value } = e.target

        // replace / o / / é uma expressão regular
        // /\D\g = tira tudo o que não for digito, g = globalmente
        value = value.replace(/\D/g, "")

        // formatanto para REAL $
        value = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value/100)

        e.target.value = value
    }, 1) // ,1 = 1 milisegundo
    // o setTimeout vai executar tudo e ir apagando o que não for numero
})
*/


// Outra Forma
// Criando estratégia de máscara de campo
// essa func após o input, referência o formatBRL
// essa funcção pode ser aproveitada em qualquer lugar usando o exemplo criado no HTML
// this representa de forma global, dentro do input ele representa somente o input
const Mask = {
    apply(input, func){
        setTimeout(function() {
            input.value = Mask[func](input.value)
        }, 1)
    }, 

    formatBRL(value){
        value = value.replace(/\D/g, "")
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value/100)
    },

    // Mascara para cpf ou cnpj
    cpfCnpj(value) {
        value = value.replace(/\D/g, "")

        // se for maior que 14 digitos, vai sempre ficar tirando o último
        // que seria o 15° se o user tentar digitar
        if (value.length > 14) value = value.slice(0, -1)

        // check if cnpj
        if (value.length > 11 ) { // se for maior que 11 é cnpj

            // 11.222333444455
            // /(\d{2})(\d)/  d = digito 
            value = value.replace( /(\d{2})(\d)/, "$1.$2" )

            // 11.222.333444455
            value = value.replace( /(\d{3})(\d)/, "$1.$2" )

            // 11.222.333/444455
            value = value.replace( /(\d{3})(\d)/, "$1/$2" )

            // 11.222.333/4444-55
            value = value.replace( /(\d{4})(\d)/, "$1-$2" )

        } else {
            // cpf 046.410.323-19
            value = value.replace( /(\d{3})(\d)/, "$1.$2" )
            value = value.replace( /(\d{3})(\d)/, "$1.$2" )
            value = value.replace( /(\d{3})(\d)/, "$1-$2" )
        }

        return value
    },

    cep(value) {
        // somente numeros = d
        value = value.replace(/\D/g, "")
        value = value.replace( /(\d{5})(\d)/, "$1-$2" )

        if (value.length > 9 ) value = value.slice(0 , -1)

        return value
    }
}


// =====================================================

/*
const PhotosUpload = {

    //Quando clicar em selecionar fotos, ele coloca como files dentro do event.target, 
    //e extrai chamando ele de fileList
    

    uploadLimit: 6,

    handleFileInput(event) {
        const { files: fileList } = event.target
        const { uploadLimit } = PhotosUpload

        if (fileList.length > uploadLimit) {
            alert(`Envie no máximo ${uploadLimit} fotos`)
            
            // event para bloquear o evento e não enviar os arquivos
            event.preventDefault()
            return
        }



        // TREINAR ESSA PARTE DE BAIXO, INTERESSANTE

        // transformando o fileList em Array
        Array.from(fileList).forEach( file => {
            // new FileReader, constructor, ele permite ler arquivos
            const reader = new FileReader()

            // quando ele estiver pronto, exwcuta essa função
            reader.onload = () => {
                const image = new Image() // mesma coisa que está fazendo isso: <img />

                image.src = String(reader.result) // String só para garantir que o src seja uma string

                const div = document.createElement('div')

                div.classList.add('photo')

                div.onclick = () => alert('remove Foto')

                div.appendChild(image) // appendChild insere um elemento filho ao elemento pai
                // estou colocando a image dentro da div no createElement

                document.querySelector('#photos-preview').appendChild(div)
                // photos-preview nome da classe da div que está no body
                // e coloco o appendChild, colocando a div dentro dele 
            }


            // o momento que ele vai ficar pronto, quando ler isso aqui abaixo
            reader.readAsDataURL(file)
        })

    }
}
*/


// REFATORANDO O PhotosUpload
const PhotosUpload = {
    input: "",
    preview: document.querySelector('#photos-preview'),
    uploadLimit: 6,
    
    files: [],
    
    handleFileInput(event) {
        const { files: fileList } = event.target
        PhotosUpload.input = event.target
        
        if (PhotosUpload.hasLimit(event)) return

        Array.from(fileList).forEach( file => {

            

            PhotosUpload.files.push(file) // colocando file dentro do files acima antes do handleFileInput



            const reader = new FileReader()

            reader.onload = () => {
                const image = new Image() // mesma coisa que está fazendo isso: <img />
                image.src = String(reader.result) // String só para garantir que o src seja uma string

                const div = PhotosUpload.getContainer(image)
                PhotosUpload.preview.appendChild(div)
            }

            reader.readAsDataURL(file)
        })

        // depois de files: [];, input, configurados, substitui esse abaixo:
        
        // PhotosUpload.getAllFiles()

        // por esse:

        PhotosUpload.input.files = PhotosUpload.getAllFiles()
    },

    hasLimit(event) {
        const { uploadLimit, input, preview } = PhotosUpload
        const { files: fileList} = input

        if (fileList.length > uploadLimit) {
           
            alert(`Envie no máximo ${uploadLimit} fotos`)
            
            event.preventDefault()
            return true 
        }

        // o preview é o container todo, e o childNodes é cada div(foto) dentro do container
        const photosDiv = []
        preview.childNodes.forEach(item => {
            if (item.classList && item.classList.value == 'photo')
            photosDiv.push(item)
        })

        // vai somar esses dois dando o total de fotos
        const totalPhotos = fileList.length + photosDiv.length
        if (totalPhotos > uploadLimit) {
            alert(`O limite máximo de fotos é 6!`)
            // event.preventDefault() parar evento
            event.preventDefault()
            return true
        }

        return false  
    },

    getAllFiles(){
        // new ClipboardEvent("").clipboardData - Constructor que tem no Firefox
        // new DataTransfer() - Constructor que tem no chrome
        const dataTransfer = new ClipboardEvent("").clipboardData || new DataTransfer() 

        // forEach - para cada um dos files, adiciona o dataTranfer ... (items faz parte do constructor)
        PhotosUpload.files.forEach(file => dataTransfer.items.add(file))

        return dataTransfer.files
    },

    getContainer(image) {
        const div = document.createElement('div')

        div.classList.add('photo')

        div.onclick = PhotosUpload.removePhoto

        div.appendChild(image) 

        div.appendChild(PhotosUpload.getRemoveButton())

        return div
    }, 

    getRemoveButton() {
        const button = document.createElement('i')
        button.classList.add('material-icons')
        button.innerHTML = 'close'
        return button
    }, 

    removePhoto(event) {
        const photoDiv = event.target.parentNode // <div class="photo">
        // parentNode = pega uma div acima dele, ou seja, a div com class photo
        
        // pegando como forma de array os elementos dentro do preview, a lista dele que é o children
        const photosArray = Array.from(PhotosUpload.preview.children)

        // procura no index o elemento photoDiv
        const index = photosArray.indexOf(photoDiv)

        // remover do index
        PhotosUpload.files.splice(index, 1)

        // atualizar o input rodando novamente a função getAllFiles()
        PhotosUpload.input.files = PhotosUpload.getAllFiles()

        photoDiv.remove()
        // agora essa função de remover usa-se no click de getContainer
    },

    removeOldPhoto(event){

        const photoDiv = event.target.parentNode

        // o if juntando o id='{{image.id}}' com o input "removed_files"
        if(photoDiv.id){
            const removedFiles = document.querySelector('input[name="removed_files"')
            if(removedFiles){

                // vai concatenar esse valor com o photoDiv.id
                // juntando o input com o id
                // removedFiles.value ele coloca um valor no input de removed_files
                removedFiles.value += `${photoDiv.id},` // a cada click ele coloca um id diferente
            }
        }

        photoDiv.remove()
    }
}

const ImageGallery = {
    highlight: document.querySelector('.gallery .highlight > img '),
    previews: document.querySelectorAll('.gallery-preview img'),
    setImage(e) {
        const { target } = e

        // pegando todas as imagens e para cada um roda essa linha, removendo o active caso alguma tenha.
        ImageGallery.previews.forEach(preview => preview.classList.remove('active'))

        target.classList.add('active')

        // trocando imagem
        ImageGallery.highlight.src = target.src
        Lightbox.image.src = target.src
    }
}

const Lightbox = {
    target: document.querySelector('.lightbox-target'),
    image: document.querySelector('.lightbox-target img'),
    closeButton: document.querySelector('.lightbox-target a.lightbox-close'),
    open(){
        Lightbox.target.style.opacity = 1
        Lightbox.target.style.top = 0
        Lightbox.target.style.bottom = 0
        Lightbox.closeButton.style.top = '40px'
    },
    close(){
        Lightbox.target.style.opacity = 0
        Lightbox.target.style.top = '-100%'
        Lightbox.target.style.bottom = 'initial'
        Lightbox.closeButton.style.top = '-20px'
    }
}


// validação de EMAIL
// onblur no campo de email em fields quer dizer é quando sai do campo ele dispara o Validate
const Validate = {
    apply(input, func){

        // sempre que entrar no input do email vai entrar limpando tudo
        Validate.clearError(input)


        let results = Validate[func](input.value)
        input.value = results.value

        if (results.error) 
            Validate.displayError(input, results.error)
    },

    // criando div para mostrar o error
    displayError(input, error) {
        const div = document.createElement('div')
        div.classList.add('error')
        div.innerHTML = error

        input.parentNode.appendChild(div)
        // ele fica puxando de volta para o input, só sairá quando digitar o email certo rs 
        input.focus()
    },

    clearError(input){
        const errorDiv = input.parentNode.querySelector('div')
        if (errorDiv)
            errorDiv.remove()
    },

    isEmail(value){
        let error = null

        // expressão regular para email
        // ^ = começar com alguma coisa
        // \w+/ = tipo de texto e pode ter uma ou mais letras
        // ([\.-]) = para permitir colocar ponto ou traço
        // ([\.-]?) = facultativo ?, que pode ou não ter os dois
        // \w+ = uma ou mais letras
        // * = pode ter nenhuma ou muitas letras ( o ou 1)
        //\.\w{2,3} = agora vai ter o . depois 2 ou 3 caracteres
        // o + no final para permitir algo depois do .com ou outro. ex: .com.net ou .net.br / etc
        // o $ para ele utilizar a expressão
        const mailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/

        if (!value.match(mailFormat)) 
            error = "Email inválido"

        return {
            error,
            value,
        }
    },

    isCpfCnpj(value) {
        let error = null

        const cleanValues = value.replace(/\D/g, "")

        if (cleanValues.length > 11 && cleanValues.length !== 14 ) {
            error = "CNPJ incorreto"
        } else if (cleanValues.length < 12 && cleanValues.length !== 11 ) {
            error = "CPF incorreto"
        }

        return {
            error,
            value
        }
    },

    isCep(value) {
        let error = null

        const cleanValues = value.replace(/\D/g, "")

        if (cleanValues.length !== 8 ) {
            error = "CEP incorreto"
        }

        return {
            error,
            value
        }
    }
}
