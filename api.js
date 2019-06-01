const https = require("https");
const aws4 = require("aws4");
const moment = require("moment");

const deprecated = new Map();

function noop(value){
  return value;
}

deprecated.set("GetAccountBalance", {
  updateOperation: "GetAccountBalance",
  updateParams: noop,
  updateResponse: updateGetAccountBalanceResponse
});

function updateGetAccountBalanceResponse(response){
  return {
    "OperationRequest": { "RequestId": 'requests-like-this-noww-deprecateddd' },
    "GetAccountBalanceResult" : [{
        "AvailableBalance": {
          Amount: response.AvailableBalance,
          Currency: "USD",
      }
    }]
  }
}

deprecated.set("SearchHITs", {
  updateOperation: "ListHITs",
  updateParams: noop,
  updateResponse: updateListHITsResponse
});

function updateListHITsResponse(response){
  response.HITs.forEach(HIT => {
    HIT.CreationTime = new Date(HIT.CreationTime);
    HIT.Expiration = new Date(HIT.Expiration);
    HIT.AutoApprovalDelayInSeconds = HIT.AutoApprovalDelayInSeconds.toString();
    HIT.AssignmentDurationInSeconds = HIT.AssignmentDurationInSeconds.toString();
    HIT.Reward = {
      Amount: HIT.Reward,
      CurrencyCode: "USD",
      FormattedPrice: `$${HIT.Reward}`,
    }
  })

  return {
    "OperationRequest": { "RequestId": '00000000-0000-0000-0000-000000000000' },
    "SearchHITsResult": [{
      Request: { "IsValid": "True" },
      NumResults: response.HITs.length,
      TotalNumResults: response.HITs.length,
      PageNumber: 1,
      HIT: response.HITs
    }]
  };
}

deprecated.set("CreateHIT", {
  updateOperation: "CreateHIT",
  updateParams: updateCreateHITParams,
  updateResponse: updateCreateHITResponse
});

function updateCreateHITParams(params){
  //TODO: Qualifications
  //expect(res.SearchHITsResult[0].HIT[0].QualificationRequirement).to.be.an('array');
  //expect(res.SearchHITsResult[0].HIT[0].QualificationRequirement[0].QualificationTypeId).to.be.an('string');
  const amount = params.Reward.Amount;
  params.Reward = amount.toString();
  return params;
}

function updateCreateHITResponse(response){
  response.HIT.Request = { "IsValid": "True" };

  return {
    "OperationRequest": { "RequestId": '00000000-0000-0000-0000-000000000000' },
    "NumResults": response.HIT.length,
    "TotalNumResults": response.HIT.length,
    "PageNumber": 1,
    "HIT": [response.HIT]
  };
}

deprecated.set("CreateQualificationType", {
  updateOperation: "CreateQualificationType",
  updateParams: noop,
  updateResponse: updateCreateQualificationTypeResult
});

function updateCreateQualificationTypeResult(response){
  return {
    "OperationRequest": { "RequestId": '00000000-0000-0000-0000-000000000000' },
    "QualificationType": [response.QualificationType] };
}

class MTurkAPI {

  //Backwards compatibility
  static createClient(config){
    return new Promise((resolve, reject) => {
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
  }

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

  async getAccountBalance(){
    const res = await this.req("GetAccountBalance");
    return Number(res.AvailableBalance);
  }

  get accountBalance(){
    return new Promise(async(resolve, reject) => {
      resolve(await this.getAccountBalance());
    })
  }

  async req(operation, params, shouldSkipUndeprecator) {
    const deprecatedInfo = deprecated.get(operation);
    if(deprecatedInfo && this.legacySupportEnabled && !shouldSkipUndeprecator){
      return await this.undeprecator(operation, params, deprecatedInfo)
    }

    return new Promise(async (resolve, reject) => {
      let body = params || {};
      body = JSON.stringify(body);
      const headers = this.getRequestHeaders(operation)
      const options = this.getRequestOptions(headers, body )
      aws4.sign(options, this.credentials);
      const res = await this.response(options, body);
      const isValid = this.isValid(res);

      if(isValid) resolve(res);
      else throw new Error(this.getErrorMessage(res));
    })
  }

  async undeprecator(operation, params, deprecatedInfo){
    const updatedOperation = deprecatedInfo.updateOperation;
    const updatedParams = deprecatedInfo.updateParams(params);
    const response = await this.req(updatedOperation, updatedParams, true);
    return deprecatedInfo.updateResponse(response);
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
    const isError = isPrivateType || hasMessage || hasCode;
    return !isError;
  }




  async response(options, body) {
    body = body || "{}";
    return new Promise((resolve, reject) => {
      const req = https.request(options, function (res) {
        const chunks = [];
        res.on("data", function (chunk) {
          chunks.push(chunk);
        });
        res.on("end", function () {
          let response = Buffer.concat(chunks).toString();
          response = JSON.parse(response);
          resolve(response);
        });
      }).on("error", reject);
      req.write(body);
      req.end();
    })
  }
}

//EXPORT
module.exports = MTurkAPI;
