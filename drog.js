var _u = require('underscore'),
    fs = require('fs'),
    path = require('path');

var blogRoot;

exports.init = function(options){
    var root = options.root || path.join(__directory,"blog"),
        success = options.success || function(){},
        failure = options.failure || function(){};
    loadBlogDirectory({
        dir : root,
        success : success,
        failure : failure
    });
};


var DrogEntry = function(){
    this.title = "No Title";
    this.root = "";
    this.content = "";
    this.images = [];
    this.tags = [];
};

exports.DrogEntry = DrogEntry;

var drogFunctions = {
    entries : function(){
        return [];
    },
    DrogEntry : DrogEntry
};

var loadBlogDirectory = function(options){
    var dir = options.dir, 
        success = options.success || function(){},
        failure = options.failure || function(){},
        entries = [];
    
    fs.readdir(dir, function(err, files){
        var drogDefinitions = [];
        if(err){ 
            failure(err);
            return;
        }
        //top level traversal -- each directory

        //the directory contains blog.json, form there, the magic happens
        _u.each(files, function(file){
            var definitionPath = path.join(dir,file,"blog.json"),
                stat = fs.statSync(definitionPath);
            if(stat.isFile()){
                var entry = getDrogEntryFor(definitionPath);
                entries.push(entry);
            }
        });
        success(entries);
    });
};

function getDrogEntryFor(drogJson){
    var contents = fs.readFileSync(drogJson, "UTF-8");
    var config = JSON.parse(contents);
    var entry = new DrogEntry();

    entry.root = path.dirname(drogJson);
    entry.title = config.title || "";
    entry.content = config.text || "No Title";
    config.tags = config.tags || [];

    return entry;
}
