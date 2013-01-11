var assert = require("assert"),
    path = require('path'),
    should = require('should'),
    wrench = require('wrench'),
    drog = require("../lib/drog.js");

var simpleTest = path.join(__dirname, 'simpleTest'),
    testFiles = path.join(__dirname, 'testFiles'),
    newEntryTest = path.join(testFiles, 'newEntry'),
    unpublishedTest = path.join(testFiles, 'unpublishedEntry');

describe("Drog", function(){
    var testDrog;
    before(function(done){
        testDrog = new drog.Drog({
            root : simpleTest,
            success : function(){
                console.log("created drog on dir " + simpleTest); 
                done();
            },
            failure : done
        });
    });
    after(function(){
        //clean up new entry
        var updateTestDir = path.join(simpleTest, "newEntry"),
            unpublishedDir = path.join(simpleTest, "unpublishedEntry");
        wrench.rmdirSyncRecursive(updateTestDir);
        wrench.rmdirSyncRecursive(unpublishedDir);
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

        it("should read the markdown file and interpret it properly", function(){
            var entries = testDrog.entries();
            entries[0].content.should.eql(
            "<p>This is a test blog, it doesn's actually say anything</p>" 
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

        it("should return entries in newest first date order", function(){
            var entries = testDrog.entries();
            (entries[0].date - entries[1].date).should.be.above(0)
        });

        it("should not contain entries that are marked with publish as false", function(done){
            var destDir = path.join(simpleTest, "unpublishedEntry");
            wrench.copyDirRecursive(unpublishedTest, destDir, function(){
                testDrog.entries(function(entries){
                    entries.length.should.equal(2);
                    done();
                });
            });
        })
    });
});
