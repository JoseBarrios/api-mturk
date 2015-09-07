[![NPM version][npm-image]][npm-url]
[![Downloads][download-badge]][npm-url]

![alt text](http://goo.gl/OAMdoY "Brainup")

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

 mturk.connect(config).then(function(api){

   //Example operation, no params
   api.req('GetAccountBalance').then(function(response){
      //Do something
   });

   //Example operation, with params
   api.req('SearchHITs', { PageSize: 100 }).then(function(response){
       //Do something
   });

 }).catch(console.error);

```
### Supported API Operations
Operation  | Required Parameters
------------- | -------------
[ApproveAssignment](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_ApproveAssignmentOperation.html) | { **AssignmentId**:String }
[ApproveRejectedAssignment](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_ApproveRejectedAssignmentOperation.html)   | { **AssignmentId**:String }
[AssignQualification](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_AssignQualificationOperation.html) | { **QualificationTypeId**:String, **WorkerId**:String }
[BlockWorker](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_BlockWorkerOperation.html) | { **WorkerId**:String, **Reason**:String }
[ChangeHITTypeOfHIT](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_ChangeHITTypeOfHITOperation.html) | { **HITId**:String, **HITTypeId**:String}
[CreateHIT](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_CreateHITOperation.html) | { **Title**:String, **Description**:String, **AssignmentDurationInSeconds**:Number, **LifetimeInSeconds**:Number } OR {**HITTypeId**:String, **LifetimeInSeconds**:Number }
[CreateQualificationType](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_CreateQualificationTypeOperation.html) | { **Name**:String, **Description**:String, **QualificationTypeStatus**:String }
[DisableHIT](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_DisableHITOperation.html) | { **HITId**:String }
[DisposeHIT](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_DisposeHITOperation.html) | { **HitId**:String }
[DisposeQualificationType](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_DisposeQualificationTypeOperation.html) | {**QualificationTypeId**:String}
[ExtendHIT](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_ExtendHITOperation.html) | { **HitId**:String }
[ForceExpireHIT](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_ForceExpireHITOperation.html) | { **HitId**:String }
[GetAccountBalance](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_GetAccountBalanceOperation.html) | None
[GetAssignment](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_GetAssignmentOperation.html) | { **AssignmentId**:String }
[GetAssignmentsForHIT](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_GetAssignmentsForHITOperation.html) | { **HITId**:String }
[GetBlockedWorkers](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_GetBlockedWorkersOperation.html) | *None*
[GetBonusPayments](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_GetBonusPaymentsOperation.html) | { **HITId**:String } OR { **AssignmentId**:String }
[GetFileUploadURL](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_GetFileUploadURLOperation.html) | { **AssignmentId**:String, **QuestionIdentifier**:String }
[GetHIT](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_GetHITOperation.html) | { **HITId**:String }
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
[SearchHITs](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_SearchHITsOperation.html) | *None*
[SearchQualificationTypes](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_SearchQualificationTypesOperation.html) | { **MustBeRequestable**:Boolean }
[SendTestEventNotification](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_SendTestEventNotificationOperation.html) | {  **Notification**:Object, **TestEventType**:Object }
[SetHITAsReviewing](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_SetHITAsReviewingOperation.html) | { **HITId**:String }
[SetHITTypeNotification](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_SetHITTypeNotificationOperation.html) | { **HITTypeId**:String, **Notification**:Object, }
[UnblockWorker](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_UnblockWorkerOperation.html) | { **WorkerId**:String,  }
[UpdateQualificationScore](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_UpdateQualificationScoreOperation.html) | { **QualificationTypeId**:String, **SubjectId**:String, **IntegerValue**:Number }
[UpdateQualificationType](http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_UpdateQualificationTypeOperation.html) | { **QualificationTypeId**:String }




## License

MIT © [Jose Barrios](http://github.com/JoseBarrios)

[npm-url]: https://npmjs.org/package/mturk-api
[npm-image]: https://img.shields.io/npm/v/mturk-api.svg?style=flat-square
[download-badge]: http://img.shields.io/npm/dm/mturk-api.svg?style=flat-square
