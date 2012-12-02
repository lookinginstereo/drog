var _u = require('underscore'),
    fs = require('fs'),
    path = require('path');

var DrogEntry = function(blogManifest){
    var my = this;
    my.title = "No Title";
    my.content = "";
    my.images = [];
    my.tags = [];
    my.date = new Date();
    my.root = "";

    this.load = function(drogJson){
        var contents = fs.readFileSync(drogJson, "utf8");
        var config = JSON.parse(contents);

        my.root = path.dirname(drogJson);
        my.title = config.title || "";
        my.content = parseText(my.root, config.text) || "No Title";
        my.tags = config.tags || [];
        my.date = new Date(config.date);
    }

    function parseText(root, textString){
        var varRegEx = /#{([^}]*)}/g;
        textString = textString.replace(varRegEx, function(match, group){
            var replacementText;
            var filePath = path.join(root, group);
            if(fs.statSync(filePath).isFile()){
                replacementText = fs.readFileSync(filePath);
            }else{
                replacementText =  "#{INVALID FILE REFERENCE}";
            }
            return replacementText;
        });
        return textString;
    }

    if(_u.isString(blogManifest)){
        this.load(blogManifest);
    }
};
exports.DrogEntry = DrogEntry;

var Drog = function(options){
    var root = options.root, 
        success = options.success || function(){},
        failure = options.failure || function(){},
        _entries = [],
        _cachedEntries = [];
    
    fs.readdir(root, function(err, files){
        var drogDefinitions = [];
        if(err){ 
            failure(err);
            return;
        }
        //top level traversal -- each directory
        //the directory contains blog.json, form there, the magic happens
        _u.each(files, function(file){
            var definitionPath = path.join(root,file,"blog.json"),
                stat = fs.statSync(definitionPath);
            if(stat.isFile()){
                var entry = new DrogEntry(definitionPath);
                _entries.push(entry);
            }
        });
        _cachedEntries = _entries;
        success(_entries);
    });

    this.entries = function(doneCallback){
        var callback = doneCallback || function(){};
        callback(_cachedEntries);
        return _cachedEntries;  
    };

    this.toString = function(){
        return "[Drog Object]";
    }
};
exports.Drog = Drog;
