#!/usr/bin/env node

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var restler = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
	console.log("%s does not exist. Exiting.", instr);
	process.exit(1);
	}
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkUrlFile = function(file_contents, checksfile) {
	$ = cheerio.load(file_contents);
	return checkCheerio($, checksfile);
}

var checkHtmlFile = function(htmlfile, checksfile) {
	$ = cheerioHtmlFile(htmlfile);
	return checkCheerio($, checksfile);
}

var checkCheerio = function($, checksfile) {
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
	var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
	}
    return out;
}

var clone = function(fn) {
    return fn.bind({});
};

var showResults = function(checkJson) {
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
}

if(require.main == module) {
  program
    .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKFILE_DEFAULT)
    .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
	.option('-u, --url <html_file_url', 'URL to index.html')
    .parse(process.argv);
	
	if(program.url) {
		restler.get(program.url).on('complete', function(data) {
			var checkJson = checkUrlFile(data, program.checks);
			showResults(checkJson);
			return;
		});
	} else {
		var checkJson = checkHtmlFile(program.file, program.checks);
		showResults(checkJson);
	}
} else {
    exports.checkHtmlFile = checkHtmlFile;
	exports.checkUrlFile = checkUrlFile;
}
