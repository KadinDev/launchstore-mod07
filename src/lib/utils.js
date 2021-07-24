module.exports = {
    date(timestamp) {
        const date = new Date(timestamp)

        const year = date.getFullYear()

        const month = `0${date.getMonth() + 1}`.slice(-2)

        const day = `0${date.getDate()}`.slice(-2)
    
        const hour = date.getHours()
        
        //const hour = date.getUTCHours() não precisa mais ter o UTC 
        //pq o banco de dados já está criando da forma que precisa ficar
        //foi criada a função no banco de dados na tabela de produtos,
        //que vai ficar atualizando a data automaticamente sempre que o produto tiver atualização nas informações

        //função criada no DB
        /*
            CREATE FUNCTION trigger_set_timestamp()
            RETURNS TRIGGER AS $$
            BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;

            CREATE TRIGGER set_timestamp
            BEFORE UPDATE ON products
            FOR EACH ROW
            EXECUTE PROCEDURE trigger_set_timestamp();
        */

        const minutes = date.getMinutes()
        
        return {
            day,
            month,
            year,
            hour,
            minutes,
            iso: `${year}-${month}-${day}`,
            birthDay: `${day}/${month}`,
            format: `${day}/${month}/${year}`
        } 
    },

    formatPrice(price){
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(price/100)
    },

    formatCpfCnpj(value) {
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

    formatCep(value) {
        // somente numeros = d
        value = value.replace(/\D/g, "")
        value = value.replace( /(\d{5})(\d)/, "$1-$2" )

        if (value.length > 9 ) value = value.slice(0 , -1)

        return value
    }
}