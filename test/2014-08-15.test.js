//POINT TO YOUR COFIG FILE
var config = require("../../config-oplab/aws.json");

const expect = require("chai").expect;
const assert = require("chai").assert;

//var mturk = require("../deprecated.js");
var mturk = require("../index.js");

config.sandbox = true;
var maxTimeout = 60000;
var SLOW_RESPONSE = 1000;
var fs = require("fs")

//These variables are assigned as we move through the tests
var workerId = "A2Q1RSC9MWUTL2";
var qualificationTypeId = null;
var HITId = null;
var HITTypeId = null;

describe("API Version 2014-08-15", function() {

  it("GetAccountBalance", function(done) {
    mturk.createClient(config).then(function(api){
      api.req("GetAccountBalance").then(function(res) {
        expect(res.OperationRequest).to.be.an("object");
        expect(res.OperationRequest.RequestId).to.be.a("string");
        expect(res.GetAccountBalanceResult).to.be.an("array");
        expect(res.GetAccountBalanceResult[0].Request).to.be.an("object");
        expect(res.GetAccountBalanceResult[0].Request.IsValid).to.be.a("string");
        expect(res.GetAccountBalanceResult[0].AvailableBalance).to.be.an("object");
        expect(res.GetAccountBalanceResult[0].AvailableBalance.Amount).to.be.a("string");
        assert.equal(Number(res.GetAccountBalanceResult[0].AvailableBalance.Amount), 10000);
        done();
      }).catch(done);
    })
  });

  it("CreateHIT", function(done) {
    mturk.createClient(config).then(function(api){
      fs.readFile("./templates/ExternalQuestion.xml", "utf8", function(err, data){
        if(err){throw new Error(err)}
        var params = {
          Title: "EXAMPLE",
          Description: "Answer the questions on the screen",
          Question: data,
          Keywords: "test, HIT",
          AssignmentDurationInSeconds: 180, // in 3 minutes
          AutoApprovalDelayInSeconds: 0, // auto approve the worker"s anwser and pay to him/her
          MaxAssignments: 1, // 100 worker
          LifetimeInSeconds: 86400 * 3, // 3 days
          Reward: {CurrencyCode:"USD", Amount:0.01}
        };

        api.req("CreateHIT", params).then(function(res){
          expect(res.OperationRequest).to.be.an("object");
          expect(res.HIT).to.be.an("array");
          expect(res.HIT[0].Request).to.be.an("object");
          expect(res.HIT[0].Request.IsValid).to.be.a("string");
          expect(res.HIT[0].HITId).to.be.a("string");
          expect(res.HIT[0].HITTypeId).to.be.a("string");
          HITId = res.HIT[0].HITId;
          HITTypeId = res.HIT[0].HITTypeId;
          done()
        }).catch(done);
      })
    });
  });

  it("GetHIT", function(done){
   mturk.createClient(config).then(function(api){
      api.req("GetHIT", {HITId}).then(function(res){
        expect(res.HIT).to.be.an("array");
        expect(res.HIT[0].Request).to.be.an("object");
        expect(res.HIT[0].Request.IsValid).to.be.a("string");
        expect(res.HIT[0].HITId).to.be.a("string");
        expect(res.HIT[0].HITTypeId).to.be.a("string");
        done();
      }).catch(done);
   })
  })

  it("GetAssignmentsForHIT", function(done){
    mturk.createClient(config).then(function(api){
      api.req("GetAssignmentsForHIT", {HITId}).then(function(res){
        expect(res.GetAssignmentsForHITResult).to.be.an("array");
        expect(res.GetAssignmentsForHITResult[0].Request).to.be.an("object");
        expect(res.GetAssignmentsForHITResult[0].Request.IsValid).to.be.a("string");
        assert.equal(res.GetAssignmentsForHITResult[0].Request.IsValid, "True");
        expect(res.GetAssignmentsForHITResult[0].NumResults).to.be.a("number");
        expect(res.GetAssignmentsForHITResult[0].TotalNumResults).to.be.a("number");
        expect(res.GetAssignmentsForHITResult[0].PageNumber).to.be.a("number");
        expect(res.GetAssignmentsForHITResult[0].Assignment).to.be.an("array");
        /*expect(res.GetAssignmentsForHITResult[0].Assignment[0].AssignmentId).to.be.a("string");*/
        //expect(res.GetAssignmentsForHITResult[0].Assignment[0].WorkerId).to.be.a("string");
        //expect(res.GetAssignmentsForHITResult[0].Assignment[0].HITId).to.be.a("string");
        //expect(res.GetAssignmentsForHITResult[0].Assignment[0].AssignmentStatus).to.be.a("string");
        //expect(res.GetAssignmentsForHITResult[0].Assignment[0].AutoApprovalTime).to.be.a("date");
        //expect(res.GetAssignmentsForHITResult[0].Assignment[0].AcceptTime).to.be.a("date");
        //expect(res.GetAssignmentsForHITResult[0].Assignment[0].SubmitTime).to.be.a("date");
        /*expect(res.GetAssignmentsForHITResult[0].Assignment[0].ApprovalTime).to.be.a("date");*/
        done();
      }).catch(done);
    })
  })

  it("DisableHIT", function(done){
    this.timeout(maxTimeout)
    mturk.createClient(config).then(function(api){
      fs.readFile("./templates/ExternalQuestion.xml", "utf8", function(err, data){
        if(err){throw new Error(err)}
        var params = {
          Title: "TEMP",
          Description: "Answer the questions on the screen",
          Question: data,
          Keywords: "test, HIT",
          AssignmentDurationInSeconds: 180, // in 3 minutes
          AutoApprovalDelayInSeconds: 0, // auto approve the worker"s anwser and pay to him/her
          MaxAssignments: 1, // 100 worker
          LifetimeInSeconds: 86400 * 3, // 3 days
          Reward: {CurrencyCode:"USD", Amount:0.01}
        };

        api.req("CreateHIT", params).then(function(res){
          const temp = res.HIT[0].HITId;
          setTimeout(() => {
            api.req("DisableHIT", {HITId: temp}).then(function(res){
              expect(res.DisableHITResult).to.be.an("array");
              expect(res.DisableHITResult[0].Request).to.be.an("object");
              expect(res.DisableHITResult[0].Request.IsValid).to.be.a("string");
              assert.equal(res.DisableHITResult[0].Request.IsValid, "True");
              done();
            }).catch(done);
          }, 5000)
        }).catch(done);
      })
    });
  })



  it("SearchHITs", function(done) {
    this.timeout(10000);//10sec
    mturk.createClient(config).then(function(api){
      //var params = {PageSize: 10, PageNumber: 2}
      //api.req("SearchHITs", params).then(function(res){
      api.req("SearchHITs").then(function(res){
        expect(res.OperationRequest).to.be.an("object");
        expect(res.OperationRequest.RequestId).to.be.a("string");
        expect(res.SearchHITsResult).to.be.an("array");
        expect(res.SearchHITsResult[0].Request).to.be.an("object");
        expect(res.SearchHITsResult[0].Request.IsValid).to.be.a("string");
        assert.equal(res.SearchHITsResult[0].Request.IsValid, "True");
        expect(res.SearchHITsResult[0].NumResults).to.be.a("number");
        expect(res.SearchHITsResult[0].TotalNumResults).to.be.a("number");
        expect(res.SearchHITsResult[0].PageNumber).to.be.a("number");
        expect(res.SearchHITsResult[0].HIT).to.be.an("array");
        expect(res.SearchHITsResult[0].HIT[0].HITId).to.be.a("string");
        expect(res.SearchHITsResult[0].HIT[0].HITTypeId).to.be.a("string");
        expect(res.SearchHITsResult[0].HIT[0].HITGroupId).to.be.a("string");
        expect(res.SearchHITsResult[0].HIT[0].CreationTime).to.be.a("date");
        expect(res.SearchHITsResult[0].HIT[0].Title).to.be.a("string");
        expect(res.SearchHITsResult[0].HIT[0].Description).to.be.a("string");
        expect(res.SearchHITsResult[0].HIT[0].HITStatus).to.be.a("string");
        expect(res.SearchHITsResult[0].HIT[0].MaxAssignments).to.be.a("number");
        expect(res.SearchHITsResult[0].HIT[0].Reward).to.be.an("object");
        expect(res.SearchHITsResult[0].HIT[0].Reward.Amount).to.be.an("string");
        expect(res.SearchHITsResult[0].HIT[0].Reward.CurrencyCode).to.be.an("string");
        expect(res.SearchHITsResult[0].HIT[0].Reward.FormattedPrice).to.be.an("string");
        expect(res.SearchHITsResult[0].HIT[0].AutoApprovalDelayInSeconds).to.be.an("string");
        expect(res.SearchHITsResult[0].HIT[0].Expiration).to.be.a("date");
        expect(res.SearchHITsResult[0].HIT[0].AssignmentDurationInSeconds).to.be.an("string");
        expect(res.SearchHITsResult[0].HIT[0].HITReviewStatus).to.be.an("string");
        expect(res.SearchHITsResult[0].HIT[0].NumberOfAssignmentsPending).to.be.an("number");
        expect(res.SearchHITsResult[0].HIT[0].NumberOfAssignmentsAvailable).to.be.an("number");
        expect(res.SearchHITsResult[0].HIT[0].NumberOfAssignmentsCompleted).to.be.an("number");
        done();
      }).catch(done);
    })
  });

  it("CreateQualificationType", function(done) {
    mturk.createClient(config).then(function(api){
      var params = { Name:"SANDBOX_QUALIFICATION_"+Date.now(), Description:"THIS IS A SANDBOX QUALIFICATION FOR TESTING PURPOSES", QualificationTypeStatus:"Active" }
      api.req("CreateQualificationType", params).then(function(res){
        expect(res.OperationRequest).to.be.an("object");
        expect(res.OperationRequest.RequestId).to.be.a("string");
        expect(res.QualificationType).to.be.an("array");
        expect(res.QualificationType[0].Request).to.be.an("object");
        expect(res.QualificationType[0].Request.IsValid).to.be.a("string");
        expect(res.QualificationType[0].QualificationTypeId).to.be.a("string");
        expect(res.QualificationType[0].CreationTime).to.be.a("date");
        expect(res.QualificationType[0].Name).to.be.a("string");
        expect(res.QualificationType[0].Description).to.be.a("string");
        expect(res.QualificationType[0].QualificationTypeStatus).to.be.a("string");
        expect(res.QualificationType[0].AutoGranted).to.be.a("boolean");
        qualificationTypeId = res.QualificationType[0].QualificationTypeId;
        done();
      }).catch(done)
    });
  });

  it("BlockWorker", function(done) {
    mturk.createClient(config).then(function(api){
      api.req("BlockWorker", {WorkerId:workerId, Reason:"Testing block operation" }).then(function(res){
        expect(res.OperationRequest).to.be.an("object");
        expect(res.OperationRequest.RequestId).to.be.a("string");
        expect(res.BlockWorkerResult).to.be.an("array");
        expect(res.BlockWorkerResult[0].Request).to.be.an("object");
        expect(res.BlockWorkerResult[0].Request.IsValid).to.be.a("string");
        done();
      }).catch(done);
    })
  });

  it("GetBlockedWorkers", function(done) {
    mturk.createClient(config).then(function(api){
      api.req("GetBlockedWorkers").then(function(res){
        expect(res.OperationRequest).to.be.an("object");
        expect(res.OperationRequest.RequestId).to.be.a("string");
        expect(res.GetBlockedWorkersResult).to.be.an("array");
        expect(res.GetBlockedWorkersResult[0].Request).to.be.an("object");
        expect(res.GetBlockedWorkersResult[0].Request.IsValid).to.be.a("string");
        expect(res.GetBlockedWorkersResult[0].NumResults).to.be.a("number");
        expect(res.GetBlockedWorkersResult[0].TotalNumResults).to.be.a("number");
        expect(res.GetBlockedWorkersResult[0].PageNumber).to.be.a("number");
        expect(res.GetBlockedWorkersResult[0].WorkerBlock).to.be.a("array");
        expect(res.GetBlockedWorkersResult[0].WorkerBlock[0].WorkerId).to.be.a("string");
        expect(res.GetBlockedWorkersResult[0].WorkerBlock[0].Reason).to.be.a("string");
        done();
      }).catch(done);
    })
  });

  it("AssignQualification", function(done) {
    this.timeout(maxTimeout)
    this.slow(SLOW_RESPONSE);
    mturk.createClient(config).then(function(api){
      api.req("AssignQualification", { QualificationTypeId: qualificationTypeId, WorkerId:workerId }).then(function(res){
        expect(res.OperationRequest).to.be.an("object");
        expect(res.OperationRequest.RequestId).to.be.a("string");
        expect(res.AssignQualificationResult).to.be.an("array");
        expect(res.AssignQualificationResult[0].Request).to.be.an("object");
        expect(res.AssignQualificationResult[0].Request.IsValid).to.be.a("string");
        done();
      }).catch(done);
    })
  });

  it("GetHIT", function(done) {
    mturk.createClient(config).then(function(api){
      api.req("GetHIT", { HITId:HITId } ).then(function(res){
        expect(res.OperationRequest).to.be.an("object");
        expect(res.OperationRequest.RequestId).to.be.a("string");
        expect(res.HIT).to.be.an("array");
        expect(res.HIT[0].Request).to.be.an("object");
        expect(res.HIT[0].Request.IsValid).to.be.a("string");
        expect(res.HIT[0].HITId).to.be.a("string");
        expect(res.HIT[0].HITTypeId).to.be.a("string");
        expect(res.HIT[0].HITGroupId).to.be.a("string");
        expect(res.HIT[0].CreationTime).to.be.a("date");
        expect(res.HIT[0].Title).to.be.a("string");
        expect(res.HIT[0].Description).to.be.a("string");
        expect(res.HIT[0].Question).to.be.a("string");
        expect(res.HIT[0].Keywords).to.be.a("string");
        expect(res.HIT[0].HITStatus).to.be.a("string");
        expect(res.HIT[0].MaxAssignments).to.be.a("number");
        expect(res.HIT[0].Reward).to.be.an("object");
        expect(res.HIT[0].Reward.Amount).to.be.an("string");
        expect(res.HIT[0].Reward.CurrencyCode).to.be.an("string");
        expect(res.HIT[0].Reward.FormattedPrice).to.be.an("string");
        expect(res.HIT[0].AutoApprovalDelayInSeconds).to.be.a("string");
        expect(res.HIT[0].Expiration).to.be.a("date");
        expect(res.HIT[0].AssignmentDurationInSeconds).to.be.a("string");
        expect(res.HIT[0].HITReviewStatus).to.be.a("string");
        done();
      }).catch(done);
    })
  });

  it("DisposeQualificationType", function(done){
    mturk.createClient(config).then(function(api){
      api.req("DisposeQualificationType",{QualificationTypeId : qualificationTypeId}).then(function(res){
        expect(res.OperationRequest).to.be.an("object");
        expect(res.OperationRequest.RequestId).to.be.a("string");
        expect(res.DisposeQualificationTypeResult).to.be.an("array");
        expect(res.DisposeQualificationTypeResult[0].Request).to.be.an("object");
        expect(res.DisposeQualificationTypeResult[0].Request.IsValid).to.be.a("string");
        done();
      }).catch(done);
    })
  })

  ////////REQUIIRES AMAZON SQS SERVICE (AND SETUP)
  ////////DONT FORGET TO REMOVE "SKIP" TO ENABLE THE TEST
  ////////IF YOU ARE A CONTRIBUTOR, DONT FORGET TO
  ////////REMOVE YOUR HOOK AND/OR CREDENTIALS BEFORE
  ////////PUSHING TO THE REPO
  it("SetHITTypeNotification", function(done) {
    this.timeout(maxTimeout)
    this.slow(SLOW_RESPONSE);

    mturk.createClient(config).then(function(api){
      const notification = {};
      notification.Destination = config.destination;
      notification.Transport = config.transport;
      notification.Version = config.notificationVersion;
      notification.EventType = config.eventType;

      var setHITTypeNotificationParams = {
        Notification: notification,
        HITTypeId: HITTypeId,
        Active: true,
      }

      api.req("SetHITTypeNotification", setHITTypeNotificationParams).then(function(res){
        expect(res.OperationRequest).to.be.an("object");
        expect(res.OperationRequest.RequestId).to.be.a("string");
        expect(res.SetHITTypeNotificationResult).to.be.an("array");
        expect(res.SetHITTypeNotificationResult[0].Request).to.be.an("object");
        expect(res.SetHITTypeNotificationResult[0].Request.IsValid).to.be.a("string");
        done()
      }).catch(done)
    })
  })

  it("ForceExpireHIT", function(done) {
    mturk.createClient(config).then(function(api){
      api.req("ForceExpireHIT", { HITId:HITId }).then(function(res){
        expect(res.OperationRequest).to.be.an("object");
        expect(res.OperationRequest.RequestId).to.be.a("string");
        expect(res.ForceExpireHITResult).to.be.an("array");
        expect(res.ForceExpireHITResult[0].Request).to.be.an("object");
        expect(res.ForceExpireHITResult[0].Request.IsValid).to.be.a("string");
        done();
      }).catch(done);
    })
  });

  it("DisposeHIT", function(done) {
    mturk.createClient(config).then(function(api){
      api.req("DisposeHIT", { HITId:HITId }).then(function(res){
        expect(res.OperationRequest).to.be.an("object");
        expect(res.OperationRequest.RequestId).to.be.a("string");
        expect(res.DisposeHITResult).to.be.an("array");
        expect(res.DisposeHITResult[0].Request).to.be.an("object");
        expect(res.DisposeHITResult[0].Request.IsValid).to.be.a("string");
        done();
      }).catch(done);
    })
  });

});


/////////////////////
//LEGACY SUPPORT CHECKS
/////////////////////
/*describe("Testing throttling (give it a few secs)", function() {*/

////slows down requests to keep them under the allowed limits
//it("Multiple simulataneous requests", function(done) {
////allow for extra time
//this.timeout(60000);
//mturk.createClient(config).then(function(api){
//var MAX_ITERATIONS = 30;
//var pageNum = 1;
//for(var i=0; i < MAX_ITERATIONS; i++){
//api.req("SearchHITs", { PageSize: 1, PageNumber: pageNum }).then(function(response){
//console.log(response);
//var currpage = Number(response.SearchHITsResult[0].PageNumber);
//if(currpage >= MAX_ITERATIONS){ done(); }
//}).catch(function(err){
//console.log(err);
//throw new Error(err);
//});
//pageNum++;
//}
//})
//})
/*});*/
