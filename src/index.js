////////////////////////////////////////////////////
//                   Imports
////////////////////////////////////////////////////
var deref = require('json-schema-deref-local');
var schemas = deref(require(process.cwd() + '/schema/API.json'));
var instantiator = require('json-schema-instantiator');
var EventEmitter = require("events").EventEmitter;
var CryptoJS = require('crypto-js');
var ZSchema = require("z-schema");
var Promise = require('promise');
var validator = new ZSchema();
var soap = require('soap');
var _ = require('lodash');

var WSDL = 'https://mechanicalturk.amazonaws.com/AWSMechanicalTurk/AWSMechanicalTurkRequester.wsdl';
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
                var operations = _.keys(client.AWSMechanicalTurkRequester.AWSMechanicalTurkRequesterPort);
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

//EXPORT
module.exports = new MTurkAPI();



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
            /////////////////////////////////////////////////////////////
            // VALIDATE REQUEST /////////////////////////////////////////
            /////////////////////////////////////////////////////////////
            var paramSchema = schemas.definitions[operation + 'Request'];
            //var instance = instantiator.instantiate(paramSchema);
            validator.validate(params, paramSchema, function (err, valid) {
                if(err){reject(err)}
                //params = _.merge(instance, params);

                //////////////////////////////////////////////////////////////////////////////
                // RESPONSE //////////////////////////////////////////////////////////////////
                //////////////////////////////////////////////////////////////////////////////
                if(typeof client[operation] === 'undefined'){reject('Invalid operation: '+operation)}
                client[operation](getRequestMessage(options, operation, params), function(err, response){
                    var keys = _.keys(response);
                    var responseResult = keys[1];
                    var schema = schemas.definitions[responseResult];
                    validator.validate(response, schema, function (err, valid) {
                        if(err){reject(err)}
                        var result = operation + 'Result';
                        switch(operation){

                            case 'GetAccountBalance':
                                var details = response[responseResult][0];
                            details = details.AvailableBalance;
                            details.Request = {};
                            details.Request.IsValid = true;
                            details.Operation = operation;
                            resolve(details);
                            break;

                            case 'CreateQualificationType':
                                var details = response.QualificationType[0];
                            if(details.Request.IsValid === "True"){
                                details.Request.IsValid = true;
                                details.Operation = operation;
                                resolve(details);
                            } else { reject(details.Request.Errors.Error[0])}
                            break;

                            case 'UpdateQualificationType':
                                var details = response.QualificationType[0];
                            if(details.Request.IsValid === "True"){
                                details.Request.IsValid = true;
                                details.Operation = operation;
                                resolve(details);
                            } else { reject(details.Request.Errors.Error[0]) }
                            break;

                            case 'GetQualificationType':
                                var details = response.QualificationType[0];
                            if(details.Request.IsValid === "True"){
                                details.Request.IsValid = true;
                                details.Operation = operation;
                                resolve(details);
                            } else { reject(details.Request.Errors.Error[0]) }
                            break;

                            case 'GetHIT':
                                var details = response.HIT[0];
                            if(details.Request.IsValid === "True"){
                                details.Request.IsValid = true;
                                details.Operation = operation;
                                resolve(details);
                            } else { reject(details.Request.Errors.Error[0]) }
                            break;

                            default: details = response[result][0];
                            if(details.Request.IsValid === "True"){
                                details.Request.IsValid = true;
                                details.Operation = operation;
                                resolve(details);
                            } else { reject(details.Request.Errors.Error[0]) }
                            break;
                        };
                    });
                });
            });
        });
    };
}
