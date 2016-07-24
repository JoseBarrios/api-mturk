var mturk = require('../index.js');
var config = require('../config.js');
var maxTimeout = 10000;
var SLOW_RESPONSE = 1000;
config.sandbox = true;
var fs = require('fs');

var _ = require('lodash')

//These variables are assign as we move through the tests
var workerId = "A2Q1RSC9MWUTL2";
var qualificationTypeId = null;
var HITId = null;
var HITTypeId = null;
var assignmentId = null;


describe('Amazon Mechanical Turk API', function() {

    it('CreateHIT', function(done) {
        mturk.createClient(config).then(function(api){
            fs.readFile('./templates/HTMLQuestion.xml', 'utf8', function(err, data){
                if(err){console.error(err);return}
                var params = {
                    Title: "EXAMPLE",
                    Description: "Answer the questions on the screen",
                    Question: _.escape(data),
                    Keywords: "test, HIT",
                    AssignmentDurationInSeconds: 180, // in 3 minutes
                    AutoApprovalDelayInSeconds: 0, // auto approve the worker's anwser and pay to him/her
                    MaxAssignments: 1, // 100 worker
                    LifetimeInSeconds: 86400 * 3, // 3 days
                    Reward: {CurrencyCode:'USD', Amount:0.01}
                };

                api.req('CreateHIT', params).then(function(res){
                    done()
                }).catch(done);
            })
        });
    });

    it('SearchHITs', function(done) {
        mturk.createClient(config).then(function(api){
            var params = {PageSize: 1}
            api.req('SearchHITs', params).then(function(res){
                HITId = res.SearchHITsResult[0].HIT[0].HITId;
                done();
            }).catch(done);
        })
    });

    it('CreateQualificationType', function(done) {
        mturk.createClient(config).then(function(api){
            var params = { Name:'SANDBOX_QUALIFICATION_2', Description:'THIS IS A SANDBOX QUALIFICATION FOR TESTING PURPOSES', QualificationTypeStatus:'Active' }
            api.req('CreateQualificationType', params).then(function(res){
                qualificationTypeId = res.QualificationType[0].QualificationTypeId;
                done();
            }).catch(done)
        });
    });

    it('GetAccountBalance', function(done) {
        mturk.createClient(config).then(function(api){
            api.req('GetAccountBalance').then(function(res) {
                done();
            }).catch(done);
        })
    });

    it('BlockWorker', function(done) {
        mturk.createClient(config).then(function(api){
            api.req('BlockWorker', {WorkerId:workerId, Reason:"Testing block operation" }).then(function(res){
                done();
            }).catch(done);
        })
    });

    it('GetBlockedWorkers', function(done) {
        mturk.createClient(config).then(function(api){
            api.req('GetBlockedWorkers').then(function(res){
                done();
            }).catch(done);
        })
    });

    it('UnblockWorker', function(done) {
        mturk.createClient(config).then(function(api){
            api.req('UnblockWorker', { WorkerId:workerId }).then(function(res){
                done();
            }).catch(done);
        })
    });

    it('AssignQualification', function(done) {
        mturk.createClient(config).then(function(api){
            api.req('AssignQualification', { QualificationTypeId: qualificationTypeId, WorkerId:workerId }).then(function(res){
                done();
            }).catch(done);
        })
    });

    it('GetHIT', function(done) {
        mturk.createClient(config).then(function(api){
            api.req('GetHIT', { HITId:HITId } ).then(function(res){
                done();
            }).catch(done);
        })
    });

    it('DisposeQualificationType', function(done){
        mturk.createClient(config).then(function(api){
            api.req('DisposeQualificationType',{QualificationTypeId : qualificationTypeId}).then(function(res){
                done();
            }).catch(done);
        })
    })


    it('ForceExpireHIT', function(done) {
        mturk.createClient(config).then(function(api){
            api.req('ForceExpireHIT', { HITId:HITId }).then(function(res){
                done();
            }).catch(done);
        })
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
    it('Multiple simulataneous requests', function(done) {
        //Allow for extra time
        this.timeout(20000);
        this.slow(20000);
        mturk.createClient(config).then(function(api){
            var MAX_ITERATIONS = 30;
            var pageNum = 1;
            for(var i=0; i < MAX_ITERATIONS; i++){
                api.req('SearchHITs', { PageSize: 100, PageNumber: pageNum }).then(function(response){
                    var currPage = Number(response.SearchHITsResult[0].PageNumber);
                    if(currPage === MAX_ITERATIONS){ done(); }
                }).catch(done);
                pageNum++;
            }

        })
    })

    //MORE TO COME

});


///////////////////////
//LEGACY SUPPORT CHECKS
///////////////////////
describe('Legacy support checks', function() {

    //COVERS 1.0.0 to 1.3.5
    it('v1.0 Compatibility', function(done) {
        this.timeout(20000);
        this.slow(20000);
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
