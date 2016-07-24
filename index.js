////////////////////////////////////////////////////
//                   Imports
////////////////////////////////////////////////////
var PromiseThrottle = require('promise-throttle');
var EventEmitter = require("events").EventEmitter;
var CryptoJS = require('crypto-js');
var soap = require('soap');
var _ = require('lodash')

//var WSDL = 'https://mechanicalturk.amazonaws.com/AWSMechanicalTurk/AWSMechanicalTurkRequester.wsdl';
var WSDL = __dirname + '/schemas/AWSMechanicalTurkRequester-2014-08-15.wsdl';
var PRODUCTION = 'https://mechanicalturk.amazonaws.com/';
var SANDBOX = 'https://mechanicalturk.sandbox.amazonaws.com/';
var SERVICE = 'AWSMechanicalTurkRequester';

//Throttles client requests to a  rate-limited 3 request per second,  makes sure mturk does not return
//503 errors when it is overwhealmed by multiple simultaneous requests (by requests in a for loop, for example)
var requestQueue = new PromiseThrottle({
    requestsPerSecond: 3,           // up to 1 request per second
    promiseImplementation: Promise  // the Promise library you are using
});

function MTurkAPI() {

    var mturk = this;

    mturk.createClient = mturk.connect = function(config) { return new Promise(function(resolve, reject){

        soap.createClient(WSDL, function(err, SOAPClient) {
            //Check that the SOAP client was created propery
            if(err){ console.error(err); return reject(err) }
            //Configure client
            var endPoint = config.sandbox? SANDBOX : PRODUCTION;
            SOAPClient.setEndpoint(endPoint);

            //Get all the operations from the WSDL description
            var operations = Object.keys(SOAPClient.AWSMechanicalTurkRequester.AWSMechanicalTurkRequesterPort);
            var numOperations = operations.length;

            //Build an API based on the client, config and WSDL description
            var api = buildAPI(SOAPClient, config, operations);

            //Main interface method
            api.req = function(operation, params) {
                var params = params || {};
                return new Promise(function(resolve, reject){
                    requestQueue.add(request.bind(this, api, operation, params)).then(resolve).catch(reject);
                })
            };

            resolve(api);
        })
    })};

    return mturk;
}

function request(api, operation, params){
    return new Promise(function(resolve, reject){
        //Check that request operation is valid, otherwise display error message
        if(api[operation] && typeof api[operation] == 'function') { api[operation](params).then(resolve).catch(reject); }
        else { reject("Invalid Amazon Mechanical Turk API operation: '"+operation+"'. See the docs here: https://goo.gl/6RCpKU"); }
    })
}

function buildAPI(client, config, operations){
    //Add a method for each available operation
    var api = {};
    _.forEach(operations, function(operation){
        api[operation] = function(params){
            var params = params || {};
            return new Promise(function(resolve, reject){
                client[operation](signRequest(config, operation, params), function(err, response){
                    if(err){ return reject(err) }
                    var valid = isValidResponse(response);
                    valid? resolve(response) : reject(getErrorMessage(response))
                });
            });
        }
    })
    return api;
}

function signRequest(config, operation, parameters){
    var message = {};
    message.Request= parameters;
    message.AWSAccessKeyId=  config.access;
    message.Timestamp = new Date().toISOString();
    var hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA1, config.secret);
    hmac.update(SERVICE + operation + message.Timestamp);
    message.Signature = hmac.finalize().toString(CryptoJS.enc.Base64);
    return message;
}

function isValidResponse(res){
    var validationProperty = 'IsValid';
    var property = search(res, validationProperty);
    if(_.isEmpty(property)) return false;
    return property[0][validationProperty] === "True"? true : false;
}

function getErrorMessage(res){
    var validationProperty = 'Error';
    var property = search(res, validationProperty);
    //Default error message is the response itself
    var defaultMsg = JSON.stringify(res, null, '\t');

    if(_.isEmpty(property)){
        return new Error(defaultMsg);
    }
    var msg = property[0][validationProperty][0].Message || defaultMsg;
    return new Error(msg);
}

function search(obj, key) {
    if (_.has(obj, key)){
        return [obj];
    }
    var res = [];
    _.forEach(obj, function(v) {
        if (typeof v == "object" && (v = search(v, key)).length)
            res.push.apply(res, v);
    });
    return res;
}

//EXPORT
module.exports = new MTurkAPI();
