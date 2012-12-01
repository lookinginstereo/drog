var assert = require("assert"),
    path = require('path'),
    should = require('should'),
    drog = require("../drog.js");

var simpleTest = path.join(__dirname, 'simpleTest');

describe("Drog", function(){
    var testDrog;
    beforeEach(function(done){
        drog.init({
            root : simpleTest,
            success : function(drogEntries){
                testDrog = drogEntries;        
                done();
            },
            failure : done
            
        });
    });
    describe("#entries()", function(){
        it("should return a list of entries", function(done){
            testDrog.should.be.an.instanceof(Array);
            testDrog.length.should.equal(1);
            done();
        }); 
        it("should read the json definition properly", function(){
            testDrog[0].should.be.an.instanceof(drog.DrogEntry);
            testDrog[0].title.should.eql("Test Entry 1");
            testDrog[0].root.should.eql(path.join(simpleTest,"testEntry1"));
            testDrog[0].date.should.equal(new Date("December 1, 2012"));
        });
        it("should read the file loading variables properly", function(){
            testDrog[0].content.should.eql(
            "This is a test blog, it doesn's actually say anything\n" 
            );
        });
    });
});
