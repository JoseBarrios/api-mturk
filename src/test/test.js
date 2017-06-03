const fs = require('fs');
const _ = require('lodash')
const should = require('should')

const mturk = require('../index.js');
const config = require('../config.js');

const MAX_TIMEOUT = 10000;
const SLOW_RESPONSE = 1000;

config.sandbox = true;


//These variables are assign as we move through the tests
const workerId = "A2Q1RSC9MWUTL2";
let qualificationTypeId = null;
let HITId = null;
let HITTypeId = null;
let assignmentId = null;


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


    it('CreateHIT', async () => {
        const api = await mturk.createClient(config);
        const res = await api.CreateHIT(getHITParams())
        should.equal(res.HIT[0].Request.IsValid, 'True')
    })


    it('SearchHITs', async () => {
        const params = {PageSize: 1}

        const api = await mturk.createClient(config)
        const res = await api.req('SearchHITs', params)
        should(res.SearchHITsResult[0].HIT[0].HITId).be.a.String()

        HITId = res.SearchHITsResult[0].HIT[0].HITId;
    });


    it('CreateQualificationType', async function() {
        let params = { Name:'SANDBOX_QUALIFICATION_4',Description:'THIS IS A SANDBOX QUALIFICATION FOR TESTING PURPOSES', QualificationTypeStatus:'Active' }

        const api = await mturk.createClient(config)        
        const res = await api.req('CreateQualificationType', params)
        should(res.QualificationType[0].QualificationTypeId).be.a.String()

        qualificationTypeId = res.QualificationType[0].QualificationTypeId;
    });


    it('GetAccountBalance', async () => {
        const api = await mturk.createClient(config);
        const balance = await api.GetAccountBalance();
        should.equal(balance.GetAccountBalanceResult[0].AvailableBalance.Amount, 10000)
    });


    it('BlockWorker', async() => {
        const params = {WorkerId:workerId, Reason:"Testing block operation" }

        const api = await mturk.createClient(config)
        const res = await api.BlockWorker(params)
        should.equal(res.BlockWorkerResult[0].Request.IsValid, 'True')
    });


    it('GetBlockedWorkers', async () => {
        const api = await mturk.createClient(config)
        const res = await api.GetBlockedWorkers()
        should.equal(res.GetBlockedWorkersResult[0].Request.IsValid, 'True')
    });


    it('UnblockWorker', async () => {
        const params = {WorkerId:workerId}

        const api = await mturk.createClient(config)
        const res = await api.UnblockWorker(params)
        should.equal(res.UnblockWorkerResult[0].Request.IsValid, 'True')
    });

    it('AssignQualification', async () => {
        const params = {QualificationTypeId: qualificationTypeId, WorkerId:workerId}

        const api = await mturk.createClient(config)
        const res = await api.AssignQualification(params)
        should.equal(res.AssignQualificationResult[0].Request.IsValid, 'True')
    });


    it('GetHIT', async () => {
        const params =  { HITId:HITId }

        const api = await mturk.createClient(config)
        const res = await api.GetHIT(params)
        should.equal(res.HIT[0].Request.IsValid, 'True')
    });


    it('DisposeQualificationType', async () => {
        const params =  { QualificationTypeId : qualificationTypeId }

        const api = await mturk.createClient(config)
        const res = await api.DisposeQualificationType(params)
        should.equal(res.DisposeQualificationTypeResult[0].Request.IsValid, 'True')
    })


    it('ForceExpireHIT', async () => {
        const params =  { HITId:HITId } 

        const api = await mturk.createClient(config)
        const res = await api.ForceExpireHIT(params)
        should.equal(res.ForceExpireHITResult[0].Request.IsValid, 'True')
    });


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

    //Slows down requests to keep them under the allowed limits
    it('Multiple simulataneous requests', async function(done) {
        const MAX_ITERATIONS = 30
        let pageNum = 1

        //Allow for extra time
        this.timeout(20000)
        this.slow(20000)
        const api = await mturk.createClient(config)
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