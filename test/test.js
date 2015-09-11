var mturk = require('../index.js');
var config = require('../config.js');
var maxTimeout = "10000";
config.sandbox = true;

var API = {};


function randomString(size) {
    var random = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < size; i++ ){
        random += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return random;
}


describe('Amazon Mechanical Turk API', function() {

    it('Connection', function(done) {
        this.timeout(maxTimeout)
        mturk.connect(config).then(function(client) {
            API = client;
            API.WorkerId = "A2Q1RSC9MWUTL2";
            API.HITId = '3G57RS03HHDCF84CT9872BY0GAT52N';
            done();
        }).catch(done);
    });


    it('AssignQualification', function(done) {
        this.timeout(maxTimeout)
        var params = { Name:'Random qualification '+randomString(10), Description:'Description', QualificationTypeStatus:'Active' }
        API.req('CreateQualificationType', params).then(function(res){
            API.QualificationTypeId = res.QualificationType[0].QualificationTypeId;
            API.req('AssignQualification', { QualificationTypeId:API.QualificationTypeId, WorkerId:API.WorkerId }).then(function(res){
                done();
                API.req('DisposeQualificationType', {QualificationTypeId:API.QualificationTypeId} )
            }).catch(done);
        }).catch(done);
    });


    it('GetAccountBalance', function(done) {
        this.timeout(maxTimeout)
        API.req('GetAccountBalance').then(function(res) {
            done();
        }).catch(done);
    });

    it('BlockWorker', function(done) {
        this.timeout(maxTimeout)
        API.req('BlockWorker', {WorkerId:API.WorkerId, Reason:"Testing block operation" }).then(function(res){
            done();
        }).catch(done);
    });

    it('GetBlockedWorkers', function(done) {
        this.timeout(maxTimeout)
        API.req('GetBlockedWorkers').then(function(res){
            done();
        }).catch(done);
    });

    it('UnblockWorker', function(done) {
        this.timeout(maxTimeout)
        API.req('UnblockWorker', { WorkerId:API.WorkerId }).then(function(res){
            done();
        }).catch(done);
    });



    it('SearchHITs', function(done) {
        this.timeout(maxTimeout)
        API.req('SearchHITs').then(function(res) {
            done();
        }).catch(done);
    });


    it('GetHIT', function(done) {
        this.timeout(maxTimeout)
        API.req('GetHIT', { HITId:API.HITId } ).then(function(res){
            done();
        }).catch(done);
    });


    it('ForceExpireHIT', function(done) {
        this.timeout(maxTimeout)
        API.req('ForceExpireHIT', { HITId:API.HITId }).then(function(res){
            done();
        }).catch(done);
    });

    it('SendTestEventNotification', function(done) {

        this.timeout(maxTimeout)
        var notification = {
            Destination: 'z8k5o8o3q0i1n9q8@cognilab.slack.com',
            Transport: "Email",
            Version: "2006-05-05",
            EventType: ["Ping"]
        }
        var params = {
            Notification: notification,
            TestEventType: ["Ping"]
        }
        API.req('SendTestEventNotification', params).then(function(res){
            done();
        }).catch(done);
    });





    /*it('XXXX', function(done) {*/
    //api.req('XXXX').then(function(res) {
    //done();
    //}, done);
    //});
});


//var pipe = {};
//UNTESTED:
//API.req('GetQualificationScore', { QualificationTypeId:pipe.QualificationTypeId, SubjectId:pipe.WorkerId} ).then(handleResponse, handleError);
//API.req('GrantQualification', { QualificationRequestId:String }).then(handleResponse, handleError);
//API.req('RejectQualificationRequest', { QualificationRequestId:String } ).then(handleResponse, handleError);
//API.req('UpdateQualificationScore', { QualificationTypeId:String, SubjectId:String, IntegerValue:Number } ).then(handleResponse, handleError);
//API.req('ApproveAssignment', { AssignmentId:String } ).then(handleResponse, handleError);


//API.req('SearchHITs').then(function(res){
//pipe.HITId = res.HIT[0].HITId;
//API.req('ExtendHIT', { HITId:pipe.HITId, ExpirationIncrementInSeconds:6000 } ).then(handleResponse, handleError);
//API.req('DisableHIT', { HITId:pipe.HITId } ).then(handleResponse, handleError);
//API.req('DisposeHIT', { HITId:pipe.HITId } ).then(handleResponse, handleError);
//}, handleError);

//VALID
//pipe.QualificationTypeId = response.QualificationTypeId;
//API.req('UpdateQualificationType',  { QualificationTypeId:pipe.QualificationTypeId, Description: 'New Description' }).then(handleResponse, handleError);
//API.req('GetHITsForQualificationType', { QualificationTypeId:pipe.QualificationTypeId } ).then(handleResponse, handleError);
//API.req('GetQualificationsForQualificationType', { QualificationTypeId:pipe.QualificationTypeId } ).then(handleResponse, handleError);
//API.req('GetQualificationRequests').then(handleResponse, handleError);
//API.req('GetQualificationType', { QualificationTypeId:pipe.QualificationTypeId } ).then(handleResponse, handleError);
//setTimeout(function(){
////API.req('RevokeQualification', { SubjectId:pipe.WorkerId, QualificationTypeId:pipe.QualificationTypeId, Reason:'Whatever' } ).then(handleResponse, handleError);
//}, 8000);
//}, handleError);

/*    API.req('BlockWorker', { WorkerId:pipe.WorkerId, Reason:'Reason goes here' } ).then(function(res){*/
//API.req('GetBlockedWorkers').then(handleResponse, handleError);
//API.req('UnblockWorker',  { WorkerId:pipe.WorkerId }).then(handleResponse, handleError);
//}, handleError);

//API.req('SearchQualificationTypes', { MustBeRequestable:true } ).then(function(res){
//});


//API.req('ChangeHITTypeOfHIT', { HITId:String, HITTypeId:String} ).then(handleResponse, handleError);
//API.req('CreateHIT', { Title:String, Description:String, AssignmentDurationInSeconds:Number, LifetimeInSeconds:Number } ).then(handleResponse, handleError);
//API.req('GetAssignment', { AssignmentId:String } ).then(handleResponse, handleError);
//API.req('GetAssignmentsForHIT', { HITId:String } ).then(handleResponse, handleError);
//API.req('GetBonusPayments', { HITId:String } ).then(handleResponse, handleError);
//API.req('GetFileUploadURL', { AssignmentId:String, QuestionIdentifier:String } ).then(handleResponse, handleError);
//API.req('GetRequesterStatistic', { Statistic:String, TimePeriod:String } ).then(handleResponse, handleError);
//API.req('GetRequesterWorkerStatistic', {Statistic:String, WorkerId:String, TimePeriod:String } ).then(handleResponse, handleError);
//API.req('GetReviewableHITs').then(handleResponse, handleError);
//API.req('GetReviewResultsForHIT', { HITId:String } ).then(handleResponse, handleError);
//API.req('GrantBonus', { WorkerId:String, AssignmentId:String, BonusAmount:Object, Reason:String }).then(handleResponse, handleError);
//API.req('NotifyWorkers', { Subject:String, MessageText:String, WorkerId:Array} ).then(handleResponse, handleError);
//API.req('RegisterHITType', { Title:String, Description:String, Reward:Object, AssignmentDurationInSeconds:Number } ).then(handleResponse, handleError);
//API.req('RejectAssignment', { AssignmentId:String } ).then(handleResponse, handleError);
//API.req('SendTestEventNotification', { Notification:Object, TestEventType:Object } ).then(handleResponse, handleError);
//API.req('SetHITAsReviewing', { HITId:String } ).then(handleResponse, handleError);
//API.req('SetHITTypeNotification', { HITTypeId:String, Notification:Object } ).then(handleResponse, handleError);

//}, function(connError){
////Handle connection error here
//console.error(connError);
//});

function handleResponse(res){

    describe('MTURK API', function () {
        describe(res.Operation, function () {
            it('should correctly add one to the given number', function () {
                assert.typeOf(foo, 'string'); // without optional message
            })
            it('should correctly add one to the given number', function () {
                assert.lengthOf(beverages.tea, 3, 'beverages has 3 types of tea');
            })
        });
    })
}


function handleError(err){
    //Do something with error
    console.error('---------------------- ERROR', err);
}
