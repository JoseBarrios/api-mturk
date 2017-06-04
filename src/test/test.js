const fs = require('fs');
const _ = require('lodash')
const should = require('should')

const mturk = require('../index.js');
const config = require('../config.js');

const MAX_TIMEOUT = 10000;
const SLOW_RESPONSE = 1000;

config.sandbox = true;


//These variables are assign as we move through the tests
const WORKER_ID = "A2Q1RSC9MWUTL2";


function getHITParams() {
    return {
                Title: "EXAMPLE",
                Description: "Answer the questions on the screen",
                Question: _.escape(fs.readFileSync(__dirname + '/../templates/HTMLQuestion.xml', 'utf8')),
                Keywords: "test, HIT",
                AssignmentDurationInSeconds: 180, // in 3 minutes
                AutoApprovalDelayInSeconds: 0, // auto approve the worker's anwser and pay to him/her
                MaxAssignments: 1, // 100 worker
                LifetimeInSeconds: 86400 * 3, // 3 days
                Reward: {CurrencyCode:'USD', Amount:0.01}
            };
}






describe('Amazon Mechanical Turk API', function() {
    let api, HITId, HITTypeId, qualificationTypeId, assignmentId

    before(async function() {
        api = await mturk.createClient(config)
    })


    describe('No HIT required tests', function () {
        it('CreateHIT', async () => {
            const res = await api.CreateHIT(getHITParams())
            should.equal(res.HIT[0].Request.IsValid, 'True')
        })


        it('RegisterHITType', async () => {
            const res = await api.RegisterHITType(getHITParams())
            should.equal(res.RegisterHITTypeResult[0].Request.IsValid, 'True')

            HITTypeId = res.RegisterHITTypeResult[0].HITTypeId
        })


        it('BlockWorker', async() => {
            const params = {WorkerId:WORKER_ID, Reason:"Testing block operation" }
            
            const res = await api.BlockWorker(params)
            should.equal(res.BlockWorkerResult[0].Request.IsValid, 'True')
        });


        it('GetBlockedWorkers', async () => {
            const res = await api.GetBlockedWorkers()
            should.equal(res.GetBlockedWorkersResult[0].Request.IsValid, 'True')
        });


        it('UnblockWorker', async () => {
            const params = {WorkerId:WORKER_ID}
            
            const res = await api.UnblockWorker(params)
            should.equal(res.UnblockWorkerResult[0].Request.IsValid, 'True')
        });


        it('GetAccountBalance', async () => {
            const balance = await api.GetAccountBalance();
            should.equal(balance.GetAccountBalanceResult[0].AvailableBalance.Amount, 10000)
        });
    })


    describe('Qualification related tests', function() {
        it('CreateQualificationType', async function() {
            let params = { Name:'SANDBOX_QUALIFICATION_5',
                        Description:'THIS IS A SANDBOX QUALIFICATION FOR TESTING PURPOSES', 
                        QualificationTypeStatus:'Active' }

            const res = await api.req('CreateQualificationType', params)
            should(res.QualificationType[0].QualificationTypeId).be.a.String()

            qualificationTypeId = res.QualificationType[0].QualificationTypeId;
        })


        it('GetHITsForQualificationType', async () => {
            const params = { "QualificationTypeId": qualificationTypeId }
            
            const res = await api.GetHITsForQualificationType(params)
            should.equal(res.GetHITsForQualificationTypeResult[0].Request.IsValid, 'True')
        })


        it('AssignQualification', async () => {
            const params = {QualificationTypeId: qualificationTypeId, WorkerId:WORKER_ID}
            
            const res = await api.AssignQualification(params)
            should.equal(res.AssignQualificationResult[0].Request.IsValid, 'True')
        })


        it('DisposeQualificationType', async () => {
            const params =  { QualificationTypeId : qualificationTypeId }
            
            const res = await api.DisposeQualificationType(params)
            should.equal(res.DisposeQualificationTypeResult[0].Request.IsValid, 'True')
        })
    })


    describe('Tests with HITs', function() {
        //Create a new HIT in before?

        it('SearchHITs', async () => {
            const params = {PageSize: 1}

            const res = await api.req('SearchHITs', params)
            should(res.SearchHITsResult[0].HIT[0].HITId).be.a.String()

            HITId = res.SearchHITsResult[0].HIT[0].HITId;
        });


        it('GetHIT', async () => {
            const params =  { HITId }
            
            const res = await api.GetHIT(params)
            should.equal(res.HIT[0].Request.IsValid, 'True')
        });


        it('ChangeHITTypeOfHIT', async () => {
            const params = { HITId, HITTypeId }
            
            const res = await api.ChangeHITTypeOfHIT(params)
            should.equal(res.ChangeHITTypeOfHITResult[0].Request.IsValid, 'True')
        })


        it('GetBonusPayments', async () => {
            const params = { HITId, HITTypeId }
            
            const res = await api.GetBonusPayments(params)
            should.equal(res.GetBonusPaymentsResult[0].Request.IsValid, 'True')
        })


        it('GetAssignmentsForHIT', async () => {
            const params = { HITId, HITTypeId }
            
            const res = await api.GetAssignmentsForHIT(params)
            should.equal(res.GetAssignmentsForHITResult[0].Request.IsValid, 'True')
        })


        it('ExtendHIT', async() => {
            const hit = await api.CreateHIT(getHITParams())
            
            const res = await api.ExtendHIT({ HITId: hit.HIT[0].HITId })             
            should.equal(res.ExtendHITResult[0].Request.IsValid, 'True')
        })


        it('ForceExpireHIT', async () => {
            const params =  { HITId } 
            
            const res = await api.ForceExpireHIT(params)
            should.equal(res.ForceExpireHITResult[0].Request.IsValid, 'True')
        })


        it('DisableHIT', async() => {
            const hit = await api.CreateHIT(getHITParams())
            
            const res = await api.DisableHIT({ HITId: hit.HIT[0].HITId })        
            should.equal(res.DisableHITResult[0].Request.IsValid, 'True')
        })
    })


    describe('DisposeHIT test', function() {
        let HITId

        before(async() => {
            const hit = await api.CreateHIT(getHITParams())
            HITId = hit.HIT[0].HITId
            await api.ForceExpireHIT({ HITId })
        })


        it('DisposeHIT', async() => {
            const res = await api.DisposeHIT({ HITId })             
            should.equal(res.DisposeHITResult[0].Request.IsValid, 'True')
        })
    })


    //REQUIIRES AMAZON SQS SERVICE (AND SETUP)
    //DONT FORGET TO REMOVE 'SKIP' TO ENABLE THE TEST
    //IF YOU ARE A CONTRIBUTOR, DONT FORGET TO
    //REMOVE YOUR HOOK AND/OR CREDENTIALS BEFORE
    //PUSHING TO THE REPO
    it.skip('SendTestEventNotification', function(done) {
        this.timeout(MAX_TIMEOUT)
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
    let api

    before(async function() {
        api = await mturk.createClient(config)
    })

    //Slows down requests to keep them under the allowed limits
    it('Multiple simulataneous requests', async function(done) {
        const MAX_ITERATIONS = 30
        let pageNum = 1

        //Allow for extra time
        this.timeout(30000)
        this.slow(30000)
        
        for(var i=0; i < MAX_ITERATIONS; i++){
            let res = await api.SearchHITs({ PageSize: 100, PageNumber: pageNum })
            let currPage = Number(res.SearchHITsResult[0].PageNumber)
            if(currPage === MAX_ITERATIONS){ done() }
            pageNum++
        }
    })

    //MORE TO COME

});


///////////////////////
//LEGACY SUPPORT CHECKS
///////////////////////
describe('Legacy support checks', function() {

    //COVERS 1.0.0 to 1.3.5
    it('v1.0 Compatibility', async function() {
        this.timeout(20000)
        this.slow(20000)
        const params = {PageSize: 1}
        //1.0 CLIENT METHODS
        const legacy = await mturk.connect(config)
        const res = await legacy.SearchHITs(params)
        should.equal(res.SearchHITsResult[0].Request.IsValid, 'True')
    })


    //MORE TO COME

});