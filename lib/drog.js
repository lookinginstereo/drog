var _u = require('underscore'),
    fs = require('fs'),
    md = require('node-markdown').Markdown,
    path = require('path');

var DrogEntry = function(blogManifest){
    var my = this;
    my.title = "No Title";
    my.content = "";
    my.images = [];
    my.tags = [];
    my.date = new Date();
    my.root = "";
    my.publish;

    this.load = function(drogJson){
        var contents = fs.readFileSync(drogJson, "utf8");
        var config = JSON.parse(contents);

        my.root = path.dirname(drogJson);
        my.title = config.title || "No Title";
        my.content = parseText(my.root, config.text) || "No Content";
        my.tags = config.tags || [];
        my.date = new Date(config.date);
        my.publish = !_u.isUndefined(config.publish) ? config.publish : true;
        console.log("Publish!? " + my.publish);
    }

    function parseText(root, textString){
        var varRegEx = /#{([^}]*)}/g;
        textString = textString.replace(varRegEx, function(match, group){
            var replacementText;
            var filePath = path.join(root, group);
            if(fs.statSync(filePath).isFile()){
                replacementText = fs.readFileSync(filePath);
                if(path.extname(filePath) === '.md'){
                    replacementText = md(String(replacementText));
                }
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
        my = this,
        success = options.success || function(){},
        failure = options.failure || function(){},
        _cacheValid = false,
        _cachedEntries = [];
    
    my._updateEntries = function(callback){
        var updatedCallback = callback || function(){};
        fs.readdir(root, function(err, files){
            var _entries = [];
            if(err){ 
                failure(err);
                return;
            }
            //top level traversal -- each directory
            //the directory contains blog.json, form there, the magic happens
            _u.each(files, function(file){
                try {
                    var definitionPath = path.join(root,file,"blog.json"),
                        stat = fs.statSync(definitionPath);
                    if(stat.isFile()){
                        var entry = new DrogEntry(definitionPath);
                        if(entry.publish){
                            _entries.push(entry);
                        }else{
                            console.log("Not publishing entry : " + entry.title);
                        }
                    }
                }catch(err){
                    console.warn(err);
                }
            });
            //sort form newest to oldest
            _entries.sort(function(a,b){return b.date - a.date});
            _cachedEntries = _entries;
            updatedCallback(_entries);
        });
    }

    this.entries = function(doneCallback){
        var callback = doneCallback || false;
        if(callback){
            if(!_cacheValid){
                my._updateEntries(function(_entries){
                    callback(_entries);
                });
            }else{
                callback(_cachedEntries);
            }
        }
        return _cachedEntries;  
    };

    this.toString = function(){
        return "[Drog Object]";
    };

    my._updateEntries(success);

    fs.watch(root, function(event, filename){
        _cacheValid = false;
        my._updateEntries();
    });
};
exports.Drog = Drog;
