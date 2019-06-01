//POINT TO YOUR COFIG FILE
const config = require("../../config-oplab/aws.json");
const expect = require("chai").expect;
const assert = require("chai").assert;
const fs = require("fs");
config.sandbox = true;

var MTurkAPI = require("../api.js");
const mturk = new MTurkAPI(config);

describe("API Version 2017-01-17", function () {

  it("GetAccountBalance", async function () {
    const res = await mturk.req("GetAccountBalance");
    expect(res).to.be.an('object');
    //expect(res.AvailableBalance).to.be.an('string');
    //done();

    assert.equal(res.AvailableBalance, "10000.00");
    const balanceFunc = await mturk.getAccountBalance();
    assert.equal(balanceFunc, 10000.00);
    const balanceProp = await mturk.accountBalance;
    assert.equal(balanceProp, 10000.00);
  });

  it("CreateHIT", function() {
    fs.readFile('./templates/HTMLQuestion.xml', 'utf8', async function(err, data){
      if(err){throw new Error(err)}
      var params = {
        Title: "EXAMPLE",
        Description: "Answer the questions on the screen",
        Question: data,
        Keywords: "test, HIT",
        AssignmentDurationInSeconds: 180, // in 3 minutes
        AutoApprovalDelayInSeconds: 0, // auto approve the worker's anwser and pay to him/her
        MaxAssignments: 1, // 100 worker
        LifetimeInSeconds: 86400 * 3, // 3 days
        Reward: "0.01"
      };

      const res = await mturk.req('CreateHIT', params);
      expect(res).to.be.an('object');
      expect(res.HIT).to.be.an('object');
      expect(res.HIT.AssignmentDurationInSeconds).to.be.a('number');
      expect(res.HIT.AutoApprovalDelayInSeconds).to.be.a('number');
      expect(res.HIT.CreationTime).to.be.a('number');
      expect(res.HIT.Description).to.be.a('string');
      expect(res.HIT.Expiration).to.be.a('number');
      expect(res.HIT.HITGroupId).to.be.a('string');
      expect(res.HIT.HITId).to.be.a('string');
      expect(res.HIT.HITReviewStatus).to.be.a('string');
      expect(res.HIT.HITStatus).to.be.a('string');
      expect(res.HIT.HITTypeId).to.be.a('string');
      expect(res.HIT.Keywords).to.be.a('string');
      expect(res.HIT.MaxAssignments).to.be.a('number');
      expect(res.HIT.NumberOfAssignmentsAvailable).to.be.a('number');
      expect(res.HIT.NumberOfAssignmentsCompleted).to.be.a('number');
      expect(res.HIT.NumberOfAssignmentsPending).to.be.a('number');
      expect(res.HIT.QualificationRequirements).to.be.an('array');
      expect(res.HIT.Question).to.be.a('string');
      expect(res.HIT.Reward).to.be.a('string');
      expect(res.HIT.Title).to.be.a('string');
    });
  });

  it('ListHITs', async function() {
    const res = await mturk.req('ListHITs');
    expect(res).to.be.an('object');
    expect(res.HITs).to.be.an('array');
    expect(res.HITs).to.be.an('array');
    expect(res.HITs[0].HITId).to.be.a('string');
    expect(res.HITs[0].HITTypeId).to.be.a('string');
    expect(res.HITs[0].HITGroupId).to.be.a('string');
    expect(res.HITs[0].CreationTime).to.be.a('number');
    expect(res.HITs[0].Title).to.be.a('string');
    expect(res.HITs[0].Description).to.be.a('string');
    expect(res.HITs[0].HITStatus).to.be.a('string');
    expect(res.HITs[0].MaxAssignments).to.be.a('number');
    expect(res.HITs[0].Reward).to.be.an('string');
    expect(res.HITs[0].AutoApprovalDelayInSeconds).to.be.an('number');
    expect(res.HITs[0].Expiration).to.be.a('number');
    expect(res.HITs[0].AssignmentDurationInSeconds).to.be.an('number');
    expect(res.HITs[0].HITReviewStatus).to.be.an('string');
    expect(res.HITs[0].NumberOfAssignmentsPending).to.be.an('number');
    expect(res.HITs[0].NumberOfAssignmentsAvailable).to.be.an('number');
    expect(res.HITs[0].NumberOfAssignmentsCompleted).to.be.an('number');
  });

  it('CreateQualificationType', async function() {
      var params = { Name:'SANDBOX_QUALIFICATION_'+Date.now(), Description:'THIS IS A SANDBOX QUALIFICATION FOR TESTING PURPOSES', QualificationTypeStatus:'Active' }
      const res = await mturk.req('CreateQualificationType', params);
      expect(res.QualificationType).to.be.an('object');
      expect(res.QualificationType.AutoGranted).to.be.a('boolean');
      expect(res.QualificationType.CreationTime).to.be.a('number');
      expect(res.QualificationType.Description).to.be.a('string');
      expect(res.QualificationType.IsRequestable).to.be.a('boolean');
      expect(res.QualificationType.Name).to.be.a('string');
      expect(res.QualificationType.QualificationTypeId).to.be.a('string');
      expect(res.QualificationType.QualificationTypeStatus).to.be.a('string');
  });

});
