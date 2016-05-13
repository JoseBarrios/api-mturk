var mturk = require('../index.js');
var config = require('../config.js');
var maxTimeout = 10000;
var SLOW_RESPONSE = 1000;
config.sandbox = true;
var fs = require('fs');

//These variables are assign as we move through the tests
var workerId = "A2Q1RSC9MWUTL2";
var QualificationTypeId = null;
var HITId = null;
var HITTypeId = null;
var assignmentId = null;

//2.0 CLIENT
var api = mturk.createClient(config);

describe('Amazon Mechanical Turk API', function() {

    it('CreateHIT', function(done) {
        fs.readFile('./templates/bonusHIT.xml', 'utf8', function(err, data){
            if(err){console.error(err);return}
            var params = {
                Title: "RANDOM HIT"+Math.random(0,10000000000),
                Keywords: "test, HIT",
                Description: "Answer the questions on the screen",
                AssignmentDurationInSeconds: 180, // in 3 minutes
                AutoApprovalDelayInSeconds: 0, // auto approve the worker's anwser and pay to him/her
                MaxAssignments: 1, // 100 worker
                Question: data,
                LifetimeInSeconds: 86400 * 3, // 3 days
                Reward: {CurrencyCode:'USD', Amount:0.01}
            };

            api.req('CreateHIT', params).then(function(res){
                done()
            }).catch(done);
        });
    });


    it('SearchHITs', function(done) {
        this.slow(SLOW_RESPONSE);
        this.timeout(maxTimeout)
        var params = {PageSize: 1}
        api.req('SearchHITs', params).then(function(res){
            HITId = res.SearchHITsResponse.SearchHITsResult[0].HIT[0].HITId[0];
            done();
        }).catch(done);
    });

    it('CreateQualificationType', function(done) {
        this.slow(SLOW_RESPONSE);
        this.timeout(maxTimeout)
        var params = { Name:'SANDBOX_QUALIFICATION', Description:'THIS IS A SANDBOX QUALIFICATION FOR TESTING PURPOSES', QualificationTypeStatus:'Active' }
        api.req('CreateQualificationType', params).then(function(res){
            qualificationTypeId = res.CreateQualificationTypeResponse.QualificationType[0].QualificationTypeId[0];
            done();
        }).catch(done);
    });

    it('GetAccountBalance', function(done) {
        this.slow(SLOW_RESPONSE);
        this.timeout(maxTimeout)
        api.req('GetAccountBalance').then(function(res) {
            done();
        }).catch(done);
    });

    it('BlockWorker', function(done) {
        this.slow(SLOW_RESPONSE);
        this.timeout(maxTimeout)
        api.req('BlockWorker', {WorkerId:workerId, Reason:"Testing block operation" }).then(function(res){
            done();
        }).catch(done);
    });

    it('GetBlockedWorkers', function(done) {
        this.slow(SLOW_RESPONSE);
        this.timeout(maxTimeout)
        api.req('GetBlockedWorkers').then(function(res){
            done();
        }).catch(done);
    });

    it('UnblockWorker', function(done) {
        this.slow(SLOW_RESPONSE);
        this.timeout(maxTimeout)
        api.req('UnblockWorker', { WorkerId:workerId }).then(function(res){
            done();
        }).catch(done);
    });

    it('AssignQualification', function(done) {
        this.slow(SLOW_RESPONSE);
        this.timeout(maxTimeout)
        api.req('AssignQualification', { QualificationTypeId: qualificationTypeId, WorkerId:workerId }).then(function(res){
            done();
        }).catch(done);
    });



    it('GetHIT', function(done) {
        this.slow(SLOW_RESPONSE);
        this.timeout(maxTimeout)
        api.req('GetHIT', { HITId:HITId } ).then(function(res){
            done();
        }).catch(done);
    });


    it('DisposeQualificationType', function(done){
        this.slow(SLOW_RESPONSE);
        //var qualificationTypeId = '370ZSYUPB7JCOKNIVOQSWYOOB5VTLF'
        api.req('DisposeQualificationType',{QualificationTypeId : qualificationTypeId}).then(function(res){
            done();
        }).catch(done);
    })



    it('ForceExpireHIT', function(done) {
        this.slow(SLOW_RESPONSE);
        this.timeout(maxTimeout)
        api.req('ForceExpireHIT', { HITId:HITId }).then(function(res){
            done();
        }).catch(done);
    });


    //REQUIIRES AMAZON SQS SERVICE (AND SETUP)
    //DONT FORGET TO REMOVE 'SKIP' TO ENABLE THE TEST
    //IF YOU ARE A CONTRIBUTOR, DONT FORGET TO
    //REMOVE YOUR HOOK AND/OR CREDENTIALS BEFORE
    //PUSHING TO THE REPO
    it.skip('SendTestEventNotification', function(done) {
        this.timeout(maxTimeout)
        this.slow(SLOW_RESPONSE);

        var warning = new Error('Notification services require setup (on your end). See test file for details.')
        done(warning);

        var notification = {
            Destination: 'YOU NEED TO FILL THIS OUT',
            Transport: "EMAIL OR SQS MESSAGE",
            Version: "2006-05-05",
            EventType: ["Ping"]
        }

        var params = {
            Notification: notification,
            TestEventType: ["Ping"]
        }

        api.req('SendTestEventNotification', params).then(function(res){
            done();
        }).catch(done)


    });
});


///////////////////////
//LEGACY SUPPORT CHECKS
///////////////////////
describe('Testing throttling (give it a few secs)', function() {

    //Slows down requests to keep them under the allowed limits
    it('Request throttling', function(done) {
        //Allow for extra time
        this.timeout(20000);
        this.slow(20000);

        var MAX_ITERATIONS = 30;
        var pageNum = 1;
        for(var i=0; i < MAX_ITERATIONS; i++){
            api.req('SearchHITs', { PageSize: 100, PageNumber: pageNum }).then(function(response){
                var currPage = Number(response.SearchHITsResponse.SearchHITsResult[0].PageNumber);
                if(currPage === MAX_ITERATIONS){ done(); }
            }).catch(done);
            pageNum++;
        }
    })

    //MORE TO COME

});


///////////////////////
//LEGACY SUPPORT CHECKS
///////////////////////
describe('Legacy support checks', function() {


    //COVERS 1.0.0 to 1.3.5
    it('v1.0 Compatibility', function(done) {
        this.timeout(maxTimeout)
        this.slow(SLOW_RESPONSE);
        var params = {PageSize: 1}
        //1.0 CLIENT METHODS
        mturk.connect(config).then(function(legacy){
            legacy.req('SearchHITs', params).then(function(res){
                done();
            }).catch(done);
        }).catch(done)
    });


    //MORE TO COME

});





/*it('XXXX', function(done) {*/
//api.req('XXXX').then(function(res) {
//done();
//}, done);
//});


//var pipe = {};
//UNTESTED:
//api.req('GetQualificationScore', { QualificationTypeId:pipe.QualificationTypeId, SubjectId:pipe.WorkerId} ).then(handleResponse, handleError);
//api.req('GrantQualification', { QualificationRequestId:String }).then(handleResponse, handleError);
//api.req('RejectQualificationRequest', { QualificationRequestId:String } ).then(handleResponse, handleError);
//api.req('UpdateQualificationScore', { QualificationTypeId:String, SubjectId:String, IntegerValue:Number } ).then(handleResponse, handleError);
//api.req('ApproveAssignment', { AssignmentId:String } ).then(handleResponse, handleError);


//api.req('SearchHITs').then(function(res){
//pipe.HITId = res.HIT[0].HITId;
//api.req('ExtendHIT', { HITId:pipe.HITId, ExpirationIncrementInSeconds:6000 } ).then(handleResponse, handleError);
//api.req('DisableHIT', { HITId:pipe.HITId } ).then(handleResponse, handleError);
//api.req('DisposeHIT', { HITId:pipe.HITId } ).then(handleResponse, handleError);
//}, handleError);

//VALID
//pipe.QualificationTypeId = response.QualificationTypeId;
//api.req('UpdateQualificationType',  { QualificationTypeId:pipe.QualificationTypeId, Description: 'New Description' }).then(handleResponse, handleError);
//api.req('GetHITsForQualificationType', { QualificationTypeId:pipe.QualificationTypeId } ).then(handleResponse, handleError);
//api.req('GetQualificationsForQualificationType', { QualificationTypeId:pipe.QualificationTypeId } ).then(handleResponse, handleError);
//api.req('GetQualificationRequests').then(handleResponse, handleError);
//api.req('GetQualificationType', { QualificationTypeId:pipe.QualificationTypeId } ).then(handleResponse, handleError);
//setTimeout(function(){
////api.req('RevokeQualification', { SubjectId:pipe.WorkerId, QualificationTypeId:pipe.QualificationTypeId, Reason:'Whatever' } ).then(handleResponse, handleError);
//}, 8000);
//}, handleError);

/*    api.req('BlockWorker', { WorkerId:pipe.WorkerId, Reason:'Reason goes here' } ).then(function(res){*/
//api.req('GetBlockedWorkers').then(handleResponse, handleError);
//api.req('UnblockWorker',  { WorkerId:pipe.WorkerId }).then(handleResponse, handleError);
//}, handleError);

//api.req('SearchQualificationTypes', { MustBeRequestable:true } ).then(function(res){
//});


//api.req('ChangeHITTypeOfHIT', { HITId:String, HITTypeId:String} ).then(handleResponse, handleError);
//api.req('CreateHIT', { Title:String, Description:String, AssignmentDurationInSeconds:Number, LifetimeInSeconds:Number } ).then(handleResponse, handleError);
//api.req('GetAssignment', { AssignmentId:String } ).then(handleResponse, handleError);
//api.req('GetAssignmentsForHIT', { HITId:String } ).then(handleResponse, handleError);
//api.req('GetBonusPayments', { HITId:String } ).then(handleResponse, handleError);
//api.req('GetFileUploadURL', { AssignmentId:String, QuestionIdentifier:String } ).then(handleResponse, handleError);
//api.req('GetRequesterStatistic', { Statistic:String, TimePeriod:String } ).then(handleResponse, handleError);
//api.req('GetRequesterWorkerStatistic', {Statistic:String, WorkerId:String, TimePeriod:String } ).then(handleResponse, handleError);
//api.req('GetReviewableHITs').then(handleResponse, handleError);
//api.req('GetReviewResultsForHIT', { HITId:String } ).then(handleResponse, handleError);
//api.req('GrantBonus', { WorkerId:String, AssignmentId:String, BonusAmount:Object, Reason:String }).then(handleResponse, handleError);
//api.req('NotifyWorkers', { Subject:String, MessageText:String, WorkerId:Array} ).then(handleResponse, handleError);
//api.req('RegisterHITType', { Title:String, Description:String, Reward:Object, AssignmentDurationInSeconds:Number } ).then(handleResponse, handleError);
//api.req('RejectAssignment', { AssignmentId:String } ).then(handleResponse, handleError);
//api.req('SendTestEventNotification', { Notification:Object, TestEventType:Object } ).then(handleResponse, handleError);
//api.req('SetHITAsReviewing', { HITId:String } ).then(handleResponse, handleError);
//api.req('SetHITTypeNotification', { HITTypeId:String, Notification:Object } ).then(handleResponse, handleError);

//}, function(connError){
////Handle connection error here
//console.error(connError);
//});


//function handleError(err){
////Do something with error
//console.error('---------------------- ERROR', err);
//}
