var mturk = require('../src/index.js');
var options = require('./config.js')

mturk.connect(options).then(function(client){
    client.api('searchHITs', {}).then(function(response){
        console.log(response);
    }).catch(console.error)
}).catch(console.error)

console.log(mturk);
