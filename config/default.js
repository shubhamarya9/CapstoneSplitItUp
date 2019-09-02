module.exports = {
    server: {
        port: 3000,
        host: '0.0.0.0',
    },
    mongo: {
      //  url: 'mongodb://splititup:admin123@ds131323.mlab.com:31323/splititup'
  //  url:'mongodb://localhost:27017/splititup'
      url:'mongodb://splititup:akanksha123@ds121176.mlab.com:21176/splititup'
    },
    JWT_TOKEN_SECRET : '3e2yHXAo%Ghl*LsNKYMT',
    sendGrid:  {
        apiKey:'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'
    },
    platformEmailNoReply: 'splitItUp<noreply@splititup.com>',
    buildSuccess : (message,data,statusCode)=> {
        return { statusCode: statusCode || 200, message : message, data: data };
    },
    buildError : (message,statusCode) => {
        return { statusCode: statusCode || 422 , message : message=={}?"Servor Error":message || 'not found'};
    }
};
