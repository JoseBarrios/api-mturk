////////////////////////////////////////////////////
//                   Imports
////////////////////////////////////////////////////
var EventEmitter = require("events").EventEmitter;
var CryptoJS = require('crypto-js');
var Promise = require('promise');
var soap = require('soap');

//var WSDL = 'https://mechanicalturk.amazonaws.com/AWSMechanicalTurk/AWSMechanicalTurkRequester.wsdl';
var WSDL = __dirname + '/schemas/AWSMechanicalTurkRequester-2014-08-15.wsdl';
var PRODUCTION = 'https://mechanicalturk.amazonaws.com/';
var SANDBOX = 'https://mechanicalturk.sandbox.amazonaws.com/';
var SERVICE = 'AWSMechanicalTurkRequester';


function MTurkAPI() {

    var api = this;
    api.connect = function(options) {
        return new Promise(function (resolve, reject) {
            soap.createClient(WSDL, function(err, client) {
                if(err){ reject(err) }
                var endPoint = options.sandbox? SANDBOX : PRODUCTION;
                client.setEndpoint(endPoint);
                var operations = Object.keys(client.AWSMechanicalTurkRequester.AWSMechanicalTurkRequesterPort);
                var numOperations = operations.length;
                var processedOps = 0;
                var wrapper = {};

                operations.forEach(function(operation){
                    wrapClientMethods(client, wrapper, options, operation);
                    processedOps++;
                    if(processedOps === numOperations){ resolve(wrapper) }
                })

                wrapper.validOps = function(){ return operations; }
                wrapper.req = function(opName, args) {
                    return new Promise(function(resolve, reject){
                        if(wrapper[opName] && typeof wrapper[opName] == 'function') { resolve(wrapper[opName](args)); }
                        else { reject("Invalid Amazon Mechanical Turk API operation: '"+opName+"'. See the docs here: https://goo.gl/6RCpKU"); }
                    })
                };
            })
        })
    };

    return api;
}


///////////////////////////
//   IMPLEMENTATION
///////////////////////////
function getRequestMessage(options, operation, parameters){
    var message = {};
    message.Request= parameters;
    message.AWSAccessKeyId=  options.access;
    message.Timestamp = new Date().toISOString();
    var hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA1, options.secret);
    hmac.update(SERVICE + operation + message.Timestamp);
    message.Signature = hmac.finalize().toString(CryptoJS.enc.Base64);
    return message;
}

function wrapClientMethods(client, wrapper, options, operation){
    wrapper[operation] = function(params){
        var params = params || {};
        return new Promise(function(resolve, reject){
            if(typeof client[operation] === 'undefined'){reject('Invalid operation: '+operation)}
            client[operation](getRequestMessage(options, operation, params), function(err, response){
                var keys = Object.keys(response);
                var responseResult = keys[1];
                //Catch response errors:
                var request = response[responseResult][0].Request;
                if(request.IsValid === "True"){
                    resolve(response);
                } else {
                    var message = operation+" - "+request.Errors.Error[0].Message;
                    var error = new Error(message);
                    reject(error);
                }
            });
        });
    }
}

//EXPORT
module.exports = new MTurkAPI();
