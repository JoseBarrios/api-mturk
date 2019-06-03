const transformer = new Map();

transformer.set("GetAccountBalance", {
  updateOperation: "GetAccountBalance",
  updateParams: noop,
  updateResponse: updateGetAccountBalanceResponse
});

transformer.set("SearchHITs", {
  updateOperation: "ListHITs",
  updateParams: updateListHITsParams,
  updateResponse: updateListHITsResponse
});

transformer.set("CreateHIT", {
  updateOperation: "CreateHIT",
  updateParams: updateCreateHITParams,
  updateResponse: updateCreateHITResponse
});

transformer.set("CreateQualificationType", {
  updateOperation: "CreateQualificationType",
  updateParams: noop,
  updateResponse: updateCreateQualificationTypeResult
});

transformer.set("BlockWorker", {
  updateOperation: "CreateWorkerBlock",
  updateParams: noop,
  updateResponse: updateCreateWorkerBlockResponse
});

transformer.set("GetBlockedWorkers", {
  updateOperation: "ListWorkerBlocks",
  updateParams: noop,
  updateResponse: updateListWorkerBlocksResponse
});

transformer.set("AssignQualification", {
  updateOperation: "AssociateQualificationWithWorker",
  updateParams: noop,
  updateResponse: updateAssociateQualificationWithWorkerResponse
});

transformer.set("GetHIT", {
  updateOperation: "GetHIT",
  updateParams: noop,
  updateResponse: updateGetHITResponse
});

transformer.set("DisposeQualificationType", {
  updateOperation: "DeleteQualificationType",
  updateParams: noop,
  updateResponse: updateDeleteQualificationTypeResponse
});

transformer.set("SetHITTypeNotification", {
  updateOperation: "UpdateNotificationSettings",
  updateParams: updateUpdateNotificationSettingsParams,
  updateResponse: updateUpdateNotificationSettingsResponse
});

transformer.set("ForceExpireHIT", {
  updateOperation: "UpdateExpirationForHIT",
  updateParams: updateUpdateExpirationForHITParams,
  updateResponse: updateUpdateExpirationForHITResponse,
});

transformer.set("DisposeHIT", {
  updateOperation: "DeleteHIT",
  updateParams: noop,
  updateResponse: updateDeleteHITResponse,
});

module.exports = transformer;


function updateDeleteHITResponse(response) {
  response.OperationRequest = {
    "RequestId": "00000000-0000-0000-0000-000000000000"
  };
  response.DisposeHITResult = [{
    "Request": {
      "IsValid": "True"
    }
  }];
  return response;
}

function updateUpdateExpirationForHITResponse(response) {
  response.OperationRequest = {
    "RequestId": "00000000-0000-0000-0000-000000000000"
  };
  response.ForceExpireHITResult = [{
    "Request": {
      "IsValid": "True"
    }
  }];
  return response;
}

function updateUpdateExpirationForHITParams(params) {
  params.ExpireAt = 0;
  return params;
}

function updateUpdateNotificationSettingsParams(params) {
  params.Notification.EventTypes = params.Notification.EventType;
  delete params.Notification.EventType;
  return params;
}


function updateUpdateNotificationSettingsResponse(response) {
  response.OperationRequest = {
    "RequestId": "00000000-0000-0000-0000-000000000000"
  };
  response.SetHITTypeNotificationResult = [{
    "Request": {
      "IsValid": "True"
    }
  }];
  return response;
}

function updateDeleteQualificationTypeResponse(response) {
  response.OperationRequest = {
    "RequestId": "00000000-0000-0000-0000-000000000000"
  };
  response.DisposeQualificationTypeResult = [{
    "Request": {
      "IsValid": "True"
    }
  }];
  return response;
}

function updateGetHITResponse(response) {
  response.HIT.Request = {
    "IsValid": "True"
  };
  response.HIT.CreationTime = new Date(response.HIT.CreationTime);
  response.HIT.Expiration = new Date(response.HIT.Expiration);
  response.HIT.AutoApprovalDelayInSeconds = response.HIT.AutoApprovalDelayInSeconds.toString();
  response.HIT.AssignmentDurationInSeconds = response.HIT.AssignmentDurationInSeconds.toString();
  response.HIT.Reward = {
    Amount: response.HIT.Reward,
    CurrencyCode: "USD",
    FormattedPrice: `$${response.HIT.Reward}`,
  }
  response.OperationRequest = {
    "RequestId": "00000000-0000-0000-0000-000000000000"
  };
  response.HIT = [response.HIT];
  return response;
}

function updateAssociateQualificationWithWorkerResponse(response) {
  response.OperationRequest = {
    "RequestId": "00000000-0000-0000-0000-000000000000"
  };
  response.AssignQualificationResult = [{
    "Request": {
      "IsValid": "True"
    }
  }];
  return response;
}

function updateListWorkerBlocksResponse(response) {
  response.OperationRequest = {
    "RequestId": "00000000-0000-0000-0000-000000000000"
  };
  response.BlockWorkerResult = [{
    "Request": {
      "IsValid": "True"
    }
  }];
  response.GetBlockedWorkersResult = [{
    "PageNumber": 1,
    "NumResults": response.NumResults,
    "TotalNumResults": response.NumResults,
    "Request": {
      "IsValid": "True"
    },
    "WorkerBlock": response.WorkerBlocks,
  }]
  return response;
}

function updateCreateWorkerBlockResponse(response) {
  response.OperationRequest = {
    "RequestId": "00000000-0000-0000-0000-000000000000"
  };
  response.BlockWorkerResult = [{
    "Request": {
      "IsValid": "True"
    }
  }];
  return response;
}

function updateGetAccountBalanceResponse(response) {
  return {
    "OperationRequest": {
      "RequestId": "00000000-0000-0000-0000-000000000000"
    },
    "GetAccountBalanceResult": [{
      "Request": {
        "IsValid": "True"
      },
      "AvailableBalance": {
        Amount: response.AvailableBalance+"0",
        FormattedPrice: `$${response.AvailableBalance.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}`,
        Currency: "USD",
      }
    }]
  }
}

function updateListHITsParams(params){
  params = params || {};
  params.PageSize = params.PageSize || 10;
  params.PageNumber = params.PageNumber || 1;
  params.MaxResults = params.PageSize;
  return params;
}

async function updateListHITsResponse(response, params, mturk) {
  if(params.SortDirection) console.warn("SortDirection is no longer supported, by default it is Ascending");
  if(params.SortProperty) console.warn("SortProperty is no longer supported, by default it is CreationTime");

  for(let i=1; i<params.PageNumber; i++){
    response = await mturk.req("ListHITs", params);
  }

  response.HITs.forEach(HIT => {
    HIT.CreationTime = new Date(HIT.CreationTime * 1000);
    HIT.Expiration = new Date(HIT.Expiration * 1000);
    HIT.AutoApprovalDelayInSeconds = HIT.AutoApprovalDelayInSeconds.toString();
    HIT.AssignmentDurationInSeconds = HIT.AssignmentDurationInSeconds.toString();
    HIT.Reward = {
      Amount: HIT.Reward,
      CurrencyCode: "USD",
      FormattedPrice: `$${HIT.Reward}`,
    }
  })

  return {
    "OperationRequest": {
      "RequestId": "00000000-0000-0000-0000-000000000000"
    },
    "SearchHITsResult": [{
      "Request": {
        "IsValid": "True"
      },
      NumResults: response.HITs.length,
      TotalNumResults: response.HITs.length,
      PageNumber: params.PageNumber,
      HIT: response.HITs
    }]
  };
}

function updateCreateHITParams(params) {
  //TODO: Qualifications
  //expect(res.SearchHITsResult[0].HIT[0].QualificationRequirement).to.be.an("array");
  //expect(res.SearchHITsResult[0].HIT[0].QualificationRequirement[0].QualificationTypeId).to.be.an("string");
  const amount = params.Reward.Amount;
  params.Reward = amount.toString();
  return params;
}

function updateCreateHITResponse(response) {
  response.HIT.Request = {
    "IsValid": "True"
  };

  return {
    "OperationRequest": {
      "RequestId": "00000000-0000-0000-0000-000000000000"
    },
    "NumResults": response.HIT.length,
    "TotalNumResults": response.HIT.length,
    "PageNumber": 1,
    "HIT": [response.HIT]
  };
}

function updateCreateQualificationTypeResult(response) {
  response.QualificationType.Request = {
    "IsValid": "True"
  };
  response.QualificationType.CreationTime = new Date(response.QualificationType.CreationTime);
  return {
    "OperationRequest": {
      "RequestId": "00000000-0000-0000-0000-000000000000"
    },
    "QualificationType": [
      response.QualificationType
    ]
  };
}

function noop(value) {
  return value;
}

