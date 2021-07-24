/* para os testes usei o site
   https://mailtrap.io/inboxes/1407100/messages
*/
const nodemailer = require('nodemailer');


module.exports = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: "df3f8ec9ef4e26",
        pass: "2f58ff37ffdcf1"
    }
});

