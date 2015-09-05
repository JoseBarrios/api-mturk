var mturk = require('../src/index.js');
var config = require('./config.js')




mturk.connect(config).then(function(api){
    //Example operation
    api.req('SearchHITs').then(handleResponse, handleError);

}, function(connError){
    //Handle connection error here
    console.error(connError);
});

function handleResponse(res){
    //Do something with response
    //console.log('RESPONSE', res);
}

function handleError(err){
    //Do something with error
    console.log('ERROR', err);
}
