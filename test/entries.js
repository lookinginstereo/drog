var assert = require("assert"),
    path = require('path'),
    should = require('should'),
    wrench = require('wrench'),
    drog = require("../lib/drog.js");

var simpleTest = path.join(__dirname, 'simpleTest'),
    testFiles = path.join(__dirname, 'testFiles'),
    newEntryTest = path.join(testFiles, 'newEntry');

describe("Drog", function(){
    var testDrog;
    beforeEach(function(done){
        testDrog = new drog.Drog({
            root : simpleTest,
            success : function(){
                done();
            },
            failure : done
        });
    });
    after(function(){
        //clean up new entry
        var updateTestDir = path.join(simpleTest, "newEntry");
        wrench.rmdirSyncRecursive(updateTestDir);
    });
    describe("#entries()", function(){
        it("should return a list of entries", function(done){
            var entries = testDrog.entries();
            entries.should.be.an.instanceof(Array);
            entries.length.should.equal(1);
            done();
        }); 

        it("should read the json definition properly", function(){
            var entries = testDrog.entries();
            entries[0].should.be.an.instanceof(drog.DrogEntry);
            entries[0].title.should.eql("Test Entry 1");
            entries[0].root.should.eql(path.join(simpleTest,"testEntry1"));
            entries[0].date.should.equal(new Date("December 1, 2012"));
        });

        it("should read the file loading variables properly", function(){
            var entries = testDrog.entries();
            entries[0].content.should.eql(
            "This is a test blog, it doesn's actually say anything\n" 
            );
        });

        it("should refelct updated entries", function(done){
            var destDir = path.join(simpleTest, "newEntry");
            wrench.copyDirRecursive(newEntryTest, destDir, function(){
                testDrog.entries(function(entries){
                    entries.length.should.equal(2);
                    done();
                });
            });
        });

        it("should return entries in correct date order", function(){
            var entries = testDrog.entries();
            (entries[0].date - entries[1].date).should.be.above(0)
        })
    });
});
