[![NPM version][npm-image]][npm-url]
[![Downloads][download-badge]][npm-url]

![alt text](http://goo.gl/zbqlsS "Brainup")

### Install
```sh
npm install mturk-api
```
### Basic usage
```js
var mturk = require('mturk-api');

var config = {
    access : 'ACCESS_KEY_GOES_HERE',
    secret : 'SECRET_KEY_GOES_HERE',
    sandbox: true
}



//DEPRECATION NOTICE: please use mturk.createClient() instead
//the connect method will no longer be supported in v3.0
mturk.connect(config).then(function(api){
  api.req('GetAccountBalance').then(function(res){
    //Do something
  }).catch(console.error);
}).catch(console.error);


// Returns an API client; uses REST via HTTPS
var api = mturk.createClient(config);


//Example operation, no params
api.req('GetAccountBalance').then(function(response){
  //Do something
}, function(error){
  //Handle error
});


//Example operation, with params
api.req('SearchHITs', { PageSize: 100, PageNumber: 2 }).then(function(response){
   //Do something
}, function(error){
  //Handle error
});


//Amazon Mechanical Turk limits the velocity of requests.
//Normally, if you exceed the limit you will receive a
//503 Service Unavailable error. As of v2.0, our interface
//automatically throttles your requests to 3 per second.
var pageNum = 1;
var ITERATIONS = 30;
for(var i=0; i < ITERATIONS; i++){
    //These requests will be queued and executed at a rate of 3 per second
    api.req('SearchHITs', { PageSize: 100, PageNumber: pageNum }).then(function(response){
        var currPage = Number(response.SearchHITsResponse.SearchHITsResult[0].PageNumber);
        if(currPage === ITERATIONS){ done(); }
    }).catch(done);
    pageNum++;

}



```




### Supported API Operations
Operation  | Required Parameters | Unit test
------------- | ------------- | --------------
[ApproveAssignment](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_ApproveAssignmentOperation.html) | { **AssignmentId**:String }
[ApproveRejectedAssignment](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_ApproveRejectedAssignmentOperation.html)   | { **AssignmentId**:String }
[AssignQualification](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_AssignQualificationOperation.html) | { **QualificationTypeId**:String, **WorkerId**:String } | ✓
[BlockWorker](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_BlockWorkerOperation.html) | { **WorkerId**:String, **Reason**:String } | ✓
[ChangeHITTypeOfHIT](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_ChangeHITTypeOfHITOperation.html) | { **HITId**:String, **HITTypeId**:String}
[CreateHIT](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_CreateHITOperation.html) | { **Title**:String, **Description**:String, **AssignmentDurationInSeconds**:Number, **LifetimeInSeconds**:Number } OR {**HITTypeId**:String, **LifetimeInSeconds**:Number }
[CreateQualificationType](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_CreateQualificationTypeOperation.html) | { **Name**:String, **Description**:String, **QualificationTypeStatus**:String } | ✓
[DisableHIT](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_DisableHITOperation.html) | { **HITId**:String }
[DisposeHIT](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_DisposeHITOperation.html) | { **HITId**:String }
[DisposeQualificationType](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_DisposeQualificationTypeOperation.html) | {**QualificationTypeId**:String} | ✓
[ExtendHIT](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_ExtendHITOperation.html) | { **HITId**:String }
[ForceExpireHIT](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_ForceExpireHITOperation.html) | { **HITId**:String } | ✓
[GetAccountBalance](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_GetAccountBalanceOperation.html) | None | ✓
[GetAssignment](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_GetAssignmentOperation.html) | { **AssignmentId**:String }
[GetAssignmentsForHIT](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_GetAssignmentsForHITOperation.html) | { **HITId**:String }
[GetBlockedWorkers](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_GetBlockedWorkersOperation.html) | *None* | ✓
[GetBonusPayments](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_GetBonusPaymentsOperation.html) | { **HITId**:String } OR { **AssignmentId**:String }
[GetFileUploadURL](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_GetFileUploadURLOperation.html) | { **AssignmentId**:String, **QuestionIdentifier**:String }
[GetHIT](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_GetHITOperation.html) | { **HITId**:String } | ✓
[GetHITsForQualificationType](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_GetHITsForQualificationTypeOperation.html) | { **QualificationTypeId**:String }
[GetQualificationsForQualificationType](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_GetQualificationsForQualificationTypeOperation.html) | { **QualificationTypeId**:String }
[GetQualificationRequests](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_GetQualificationRequestsOperation.html) | *None*
[GetQualificationScore](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_GetQualificationScoreOperation.html) | {  **QualificationTypeId**:String, **SubjectId**:String}
[GetQualificationType](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_GetQualificationTypeOperation.html) | {  **QualificationTypeId**:String }
[GetRequesterStatistic](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_GetRequesterStatisticOperation.html) | { **Statistic**:String, **TimePeriod**:String }
[GetRequesterWorkerStatistic](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_GetRequesterWorkerStatisticOperation.html) | {**Statistic**:String, **WorkerId**:String, **TimePeriod**:String }
[GetReviewableHITs](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_GetReviewableHITsOperation.html) | *None*
[GetReviewResultsForHIT](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_GetReviewResultsForHitOperation.html) | { **HITId**:String }
[GrantBonus](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_GrantBonusOperation.html) | { **WorkerId**:String, **AssignmentId**:String, **BonusAmount**:Object, **Reason**:String }
[GrantQualification](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_GrantQualificationOperation.html) | { **QualificationRequestId**:String }
[NotifyWorkers](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_NotifyWorkersOperation.html) | { **Subject**:String, **MessageText**:String, **WorkerId**:Array}
[RegisterHITType](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_RegisterHITTypeOperation.html) | { **Title**:String, **Description**:String, **Reward**:Object, **AssignmentDurationInSeconds**:Number }
[RejectAssignment](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_RejectAssignmentOperation.html) | { **AssignmentId**:String }
[RejectQualificationRequest](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_RejectQualificationRequestOperation.html) | { **QualificationRequestId**:String }
[RevokeQualification](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_RevokeQualificationOperation.html) | { **Subject**:String, **QualificationTypeId**:String, **Reason**:String }
[SearchHITs](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_SearchHITsOperation.html) | *None* | ✓
[SearchQualificationTypes](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_SearchQualificationTypesOperation.html) | { **MustBeRequestable**:Boolean }
[SendTestEventNotification](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_SendTestEventNotificationOperation.html) | {  **Notification**:Object, **TestEventType**:Object } | ✓
[SetHITAsReviewing](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_SetHITAsReviewingOperation.html) | { **HITId**:String }
[SetHITTypeNotification](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_SetHITTypeNotificationOperation.html) | { **HITTypeId**:String, **Notification**:Object, }
[UnblockWorker](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_UnblockWorkerOperation.html) | { **WorkerId**:String,  } | ✓
[UpdateQualificationScore](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_UpdateQualificationScoreOperation.html) | { **QualificationTypeId**:String, **SubjectId**:String, **IntegerValue**:Number }
[UpdateQualificationType](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_UpdateQualificationTypeOperation.html) | { **QualificationTypeId**:String }

### Create A HIT
* Question String

assign the `a_girl_photo_url` to an image url value.

```js
var _questionString = '<?xml version="1.0"?>\n<HTMLQuestion xmlns="http://mechanicalturk.amazonaws.com/AWSMechanicalTurkDataSchemas/2011-11-11/HTMLQuestion.xsd">\n  <HTMLContent><![CDATA[<!DOCTYPE html><html><head><title>HIT</title><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/><script type=\'text/javascript\' src=\'https://s3.amazonaws.com/mturk-public/externalHIT_v1.js\'></script></head><body><form name="mturk_form" method="post" id="mturk_form" action="https://www.mturk.com/mturk/externalSubmit"><input type="hidden" value="" name="assignmentId" id="assignmentId" /><!-- Bootstrap v3.0.3 -->\r\n<link href="https://s3.amazonaws.com/mturk-public/bs30/css/bootstrap.min.css" rel="stylesheet" />\r\n<section class="container" id="Other" style="margin-bottom:15px; padding: 10px 10px; font-family: Verdana, Geneva, sans-serif; color:#333333; font-size:0.9em;">\r\n<div class="row col-xs-12 col-md-12"><!-- Instructions -->\r\n<div class="panel panel-primary">\r\n<div class="panel-heading"><strong> IS the gril in the photo hot? + '</strong></div>\r\n</div>\r\n<!-- Content Body -->\r\n\r\n<section>\r\n<fieldset>\r\n<img alt="" class="image-fixed" src="'
    + a_girl_photo_url
    + '" /><br><div class="left">\r\n<div class="radio"><label><input name="answer" type="radio" value="Yes" />YES</label></div>\r\n</div>\r\n\r\n<div class="right">\r\n<div class="radio"><input name="answer" type="radio" value="NO" /> NO </div>\r\n</div>\r\n</fieldset>\r\n</section>\r\n<!-- End Content Body --></div>\r\n</section>\r\n<!-- close container -->\r\n<style type="text/css">fieldset {\r\n    padding: 10px;\r\n    background: #fbfbfb;\r\n    border-radius: 5px;\r\n    margin-bottom: 5px;\r\n}\r\n\r\n.left {\r\n  float: left;\r\n  display: block;\r\n  padding: 20px;\r\n  width: 49%;\r\n}\r\n\r\n.right {\r\n  float: right;\r\n  display: block;\r\n  padding: 20px;\r\n  width: 49%\r\n}\r\n\r\n.image-fixed {\r\n  max-width: 512px;\r\n  max-height: 200px;\r\n}\r\n</style>\r\n<p class="text-center"><input type="submit" id="submitButton" class="btn btn-primary" value="Submit" /></p></form><script language="Javascript">turkSetAssignmentID();</script></body></html>]]></HTMLContent>\n  <FrameHeight>600</FrameHeight>\n</HTMLQuestion>';';
```

* HITOption

```js
var _HITOption = {
    Title: "Is the girl hot? (WARNING: This HIT may contain adult content. Worker discretion is advised.)"
    , Keywords: "photo"
    , Description: "Say Yes or No to the question."
    , Reward: {Amount: '0.01', CurrencyCode: 'USD', FormattedPrice: '$0.01'}
    , AssignmentDurationInSeconds: 180 // in 3 minutes
    , AutoApprovalDelayInSeconds: 28800 // auto approve the worker's anwser and pay to him/her
    , MaxAssignments: 100 // 100 worker
    , QualificationRequirement: [
        {
            QualificationTypeId: '000000000000000000L0', // HIT Approval Rate %
            Comparator: 'GreaterThan',
            IntegerValue: [60],
            RequiredToPreview: true
        },
        {
            QualificationTypeId: '000000000000000000S0', // HIT Reject Rate %
            Comparator: 'LessThan',
            IntegerValue: [10],
            RequiredToPreview: true
        },
        {
            QualificationTypeId: '00000000000000000060', // Adult Content Qualification
            Comparator: 'EqualTo',
            IntegerValue: [1],
            RequiredToPreview: true
        }]
    , Question: _questionString,
    , LifetimeInSeconds: 86400 * 3 // 3 days
};
```

* Create the HIT with the option

```js
var CreateHIT = function (HITOption, callback) {
    mturk.connect(config).then(function (api) {
        api.req('CreateHIT', _HITOption).then(function (response) {
            callback(null, response.HIT[0]);
        }, function (err) {
            callback(err);
        });
    }).catch(console.error);
};
```


## License

MIT © [Jose Barrios](http://github.com/JoseBarrios)

Banner derived from [Cosmin Cuciureanu's](https://www.behance.net/cosminkoz) [BrainUP](https://dribbble.com/shots/1108424-Brainup-Logo-Concept)

[npm-url]: https://npmjs.org/package/mturk-api
[npm-image]: https://img.shields.io/npm/v/mturk-api.svg?style=flat-square
[download-badge]: http://img.shields.io/npm/dm/mturk-api.svg?style=flat-square
