const transformer = require("./transformer/2014-2017");
const PromiseThrottle = require("promise-throttle");
const https = require("https");
const aws4 = require("aws4");


class MTurkAPI {

  //Backwards compatibility
  static createClient(config){
    return new Promise((resolve) => {
      const mturk = new MTurkAPI(config);
      mturk.legacySupportEnabled = true;
      resolve(mturk);
    })
  }

  constructor(config) {
    this.region = config.region || null;
    this.sandbox = config.sandbox || null;
    this.accessKeyId = config.accessKeyId || null;
    this.secretAccessKey = config.secretAccessKey || null;
    this.legacySupportEnabled = false;
    this.requests = new PromiseThrottle({
      requestsPerSecond: 2, // up to 2 requests per second
      promiseImplementation: Promise // the Promise library you are using
    });
  };

  get host() {
    return `mturk-requester${this.sandbox? "-sandbox" : ""}.${this.region}.amazonaws.com`;
  }

  get service() {
    return "mturk-requester";
  }

  get contentType() {
    return "application/x-amz-json-1.1";
  }

  get path() {
    return "/";
  }

  get credentials() {
    return {
      accessKeyId: this.accessKeyId,
      secretAccessKey: this.secretAccessKey
    }
  }

  getRequestHeaders(operation){
    return {
      "Host": this.host,
      "Content-Type": this.contentType,
      "X-Amz-Target": this.xAmzTarget(operation),
    }
  }

  getRequestOptions(headers, body){
    return {
      service: this.service,
      region: this.region,
      path: this.path,
      body,
      headers
    };
  }

  xAmzTarget(operation) {
    return `MTurkRequesterServiceV20170117.${operation}`;
  }

  async req(operation, params, shouldSkipUndeprecator) {

    const transformerInfo = transformer.get(operation);
    if(transformerInfo && this.legacySupportEnabled && !shouldSkipUndeprecator){
      return await this.undeprecator(operation, params, transformerInfo)
    }

    return new Promise((resolve, reject) => {
      let body = params || {};
      body = JSON.stringify(body);
      const headers = this.getRequestHeaders(operation)
      const options = this.getRequestOptions(headers, body )
      aws4.sign(options, this.credentials);

      const requestPromise = this.response.bind(this, options, body);
      this.requests.add(requestPromise)
        .then(resolve)
        .catch(reject);
    })
  }

  async undeprecator(operation, params, transformerInfo){
    const updatedOperation = transformerInfo.updateOperation;
    const updatedParams = await transformerInfo.updateParams(params, this);
    const response = await this.req(updatedOperation, updatedParams, true);
    return transformerInfo.updateResponse(response, updatedParams, this);
  }

  getErrorMessage(response){
    const header = response.hasOwnProperty("__type")? `${response.__type} -` : "";
    const code = response.hasOwnProperty("TurkErrorCode")? `${response.TurkErrorCode}.` : "";
    const message = response.hasOwnProperty("Message")? `${response.Message}:` : "Invalid Request";
    return `${header} ${code} ${message}`
  }

  isValid(response){
    const isPrivateType = response.hasOwnProperty("__type");
    const hasMessage = response.hasOwnProperty("Message");
    const hasCode = response.hasOwnProperty("TurkErrorCode");
    const isValid = !isPrivateType && !hasMessage && !hasCode;
    return isValid;
  }

  async response(options, body) {
    body = body || "{}";
    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        const chunks = [];
        res.on("data", function (chunk) {
          chunks.push(chunk);
        });
        res.on("end", ()=> {
          let response = Buffer.concat(chunks).toString();
          response = JSON.parse(response);
          if(this.isValid(response)) {
            resolve(response);
          } else {
            throw new Error(this.getErrorMessage(response));
          }
        });
      }).on("error", reject);
      req.write(body);
      req.end();
    })
  }
}

//EXPORT
module.exports = MTurkAPI;
