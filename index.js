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

deprecated.set("SearchHITs", {
  updateOperation: "ListHITs",
  updateParams: noop,
  updateResponse: updateListHITsResponse
});

deprecated.set("CreateHIT", {
  updateOperation: "CreateHIT",
  updateParams: updateCreateHITParams,
  updateResponse: updateCreateHITResponse
});

deprecated.set("CreateQualificationType", {
  updateOperation: "CreateQualificationType",
  updateParams: noop,
  updateResponse: updateCreateQualificationTypeResult
});

deprecated.set("BlockWorker", {
  updateOperation: "CreateWorkerBlock",
  updateParams: noop,
  updateResponse: updateCreateWorkerBlockResponse
});

deprecated.set("GetBlockedWorkers", {
  updateOperation: "ListWorkerBlocks",
  updateParams: noop,
  updateResponse: updateListWorkerBlocksResponse
});

deprecated.set("AssignQualification", {
  updateOperation: "AssociateQualificationWithWorker",
  updateParams: noop,
  updateResponse: updateAssociateQualificationWithWorkerResponse
});

deprecated.set("GetHIT", {
  updateOperation: "GetHIT",
  updateParams: noop,
  updateResponse: updateGetHITResponse
});

deprecated.set("DisposeQualificationType", {
  updateOperation: "DeleteQualificationType",
  updateParams: noop,
  updateResponse: updateDeleteQualificationTypeResponse
});

deprecated.set("SetHITTypeNotification", {
  updateOperation: "UpdateNotificationSettings",
  updateParams: updateUpdateNotificationSettingsParams,
  updateResponse: updateUpdateNotificationSettingsResponse
});

deprecated.set("ForceExpireHIT", {
  updateOperation: "UpdateExpirationForHIT",
  updateParams: updateUpdateExpirationForHITParams,
  updateResponse: updateUpdateExpirationForHITResponse,
});

deprecated.set("DisposeHIT", {
  updateOperation: "DeleteHIT",
  updateParams: noop,
  updateResponse: updateDeleteHITResponse,
});

function updateDeleteHITResponse(response){
  response.OperationRequest = { "RequestId": '00000000-0000-0000-0000-000000000000' };
  response.DisposeHITResult = [{ "Request": { "IsValid": "True" } }];
  return response;
}


function updateUpdateExpirationForHITResponse(response){
  response.OperationRequest = { "RequestId": '00000000-0000-0000-0000-000000000000' };
  response.ForceExpireHITResult = [{ "Request": { "IsValid": "True" } }];
  return response;
}

function updateUpdateExpirationForHITParams(params){
  params.ExpireAt = 0;
  return params;
}

function updateUpdateNotificationSettingsParams(params){
  params.Notification.EventTypes = params.Notification.EventType;
  delete params.Notification.EventType;
  return params;
}


function updateUpdateNotificationSettingsResponse(response){
  response.OperationRequest = { "RequestId": '00000000-0000-0000-0000-000000000000' };
  response.SetHITTypeNotificationResult = [{ "Request": { "IsValid": "True" } }];
  return response;
}

function updateDeleteQualificationTypeResponse(response){
  response.OperationRequest = { "RequestId": '00000000-0000-0000-0000-000000000000' };
  response.DisposeQualificationTypeResult = [{
    "Request": { "IsValid": "True" }
  }];
  return response;
}

function updateGetHITResponse(response){
  response.HIT.Request = { "IsValid": "True" };
  response.HIT.CreationTime = new Date(response.HIT.CreationTime);
  response.HIT.Expiration = new Date(response.HIT.Expiration);
  response.HIT.AutoApprovalDelayInSeconds = response.HIT.AutoApprovalDelayInSeconds.toString();
  response.HIT.AssignmentDurationInSeconds = response.HIT.AssignmentDurationInSeconds.toString();
  response.HIT.Reward = {
    Amount: response.HIT.Reward,
    CurrencyCode: "USD",
    FormattedPrice: `$${response.HIT.Reward}`,
  }
  response.OperationRequest = { "RequestId": '00000000-0000-0000-0000-000000000000' };
  response.HIT = [ response.HIT ];
  return response;
}

function updateAssociateQualificationWithWorkerResponse(response){
  response.OperationRequest = { "RequestId": '00000000-0000-0000-0000-000000000000' };
  response.AssignQualificationResult = [ { "Request": { "IsValid": "True" } } ];
  return response;
}

function updateListWorkerBlocksResponse(response){
  response.OperationRequest = { "RequestId": '00000000-0000-0000-0000-000000000000' };
  response.BlockWorkerResult = [ { "Request": { "IsValid": "True" } } ];
  response.GetBlockedWorkersResult = [{
    "PageNumber": 1,
    "NumResults": response.NumResults,
    "TotalNumResults": response.NumResults,
    "Request": { "IsValid": "True" },
    "WorkerBlock": response.WorkerBlocks,
  }]
  return response;
}

function updateCreateWorkerBlockResponse(response){
  response.OperationRequest = { "RequestId": '00000000-0000-0000-0000-000000000000' };
  response.BlockWorkerResult = [ { "Request": { "IsValid": "True" } } ];
  return response;
}

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
      "Request": { "IsValid": "True" },
      NumResults: response.HITs.length,
      TotalNumResults: response.HITs.length,
      PageNumber: 1,
      HIT: response.HITs
    }]
  };
}

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

function updateCreateQualificationTypeResult(response){
  response.QualificationType.Request = { "IsValid": "True" };
  response.QualificationType.CreationTime = new Date(response.QualificationType.CreationTime);
  return {
    "OperationRequest": { "RequestId": '00000000-0000-0000-0000-000000000000' },
    "QualificationType": [
      response.QualificationType
    ]
  };
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

      if(this.isValid(res)) {
        resolve(res);
      } else {
        throw new Error(this.getErrorMessage(res));
      }
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
    const isValid = !isPrivateType && !hasMessage && !hasCode;
    return isValid;
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
