const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
const config = require('config');
const key = Buffer.from('passwordpasswordpasswordpassword');
const iv = crypto.randomBytes(16);

exports.encrypt = (data) =>  {
    try{
        let cipher = crypto.createCipheriv(algorithm,key, iv);
        let encrypted = cipher.update(JSON.stringify(data));
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        let encryptData  = { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
        return Buffer.from(JSON.stringify(encryptData)).toString('base64');
    }catch(e){
        throw e.message;
    }
}

exports.decrypt = (string) => {
    try{
        let text =  JSON.parse(Buffer.from(string, 'base64').toString('ascii'));
        let iv = Buffer.from(text.iv, 'hex');
        let encryptedText = Buffer.from(text.encryptedData, 'hex');
        let decipher = crypto.createDecipheriv(algorithm, key, iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return JSON.parse(decrypted.toString());
    }catch(e){
        throw e.message;
    }
}

