const sgMail = require('@sendgrid/mail');
const config = require('config');
sgMail.setApiKey(config.get('sendGrid.apiKey'));



const mailService = {};

mailService.sendMail = async (mailOptions) => {
    try{
        mailOptions.from = config.get('platformEmailNoReply')
        return await sgMail.send(mailOptions);
    }catch(e){
        throw e;
    }
}


module.exports = mailService;
