
// http://track.ironman.com/newathlete.php?rid=1143240085&race=arizona&bib=6&v=3.0&beta=&1416153600
// http://track.ironman.com/newathlete.php?rid=1143240085&race=arizona&bib=24&v=3.0&beta=&1416150900

var httpsync = require('httpsync');
//var parseXML = require('xml2js').parseString;
var cheerio = require('cheerio');
//var fs = require('fs');

var waitTime = 3000; // in ms



// --- SCRAPE DATA ---
var athletes = new Array();
for (var bib = 1; bib < 94; bib++) {

var athlete = {};
athlete.times = new Array();

console.log("Checking athlete: " + bib);

var options = {
  //hostname: 'db.geopp.de',
  url: 'http://track.ironman.com/newathlete.php?rid=1143240085&race=arizona&bib='+bib+'&v=3.0&beta=&1416150900',	
  method: 'GET',
  //headers: {'user-agent': 'Mozilla/5.0'},
  useragent: 'Mozilla/5.0',
  //path: '/gnrailnav_servlet/GNOpenLayersV3?track2coor2=true&str='+rows[i][2]+'&km='+rows[i][3]+'&dir=1&rtn=3&sess=-1'
};

var htmldata = httpsync.get(options).end().data.toString();

var $ = cheerio.load(htmldata);
try{
athlete.name = $('.eventResults .moduleContentOuter .moduleContentInner section header h1').html().split('>')[3];
console.log('Name: ' + athlete.name);
} catch(e) {
	console.log("Error trying ID " + bib + ". Skipping...");
	continue;
}

// Check swimming:


// $("table").eq(0).children("tr").eq(0)
athlete.swim = $('.athlete-table-details tfoot tr td').eq(3).children('strong').html();
if(athlete.swim.charAt(0) != '-')  {
	athlete.times.push(athlete.swim);
}
console.log('Swim: ' + athlete.swim);


console.log("");

// Check bike:
var htmlbike = $('.athlete-table-details table').eq(1).children('> tr');
athlete.bike = new Array();
for(var row = 0; row < htmlbike.length; row++){
	//var rowhtml = 
	var new_value = htmlbike.eq(row).children('td').eq(3).html();
	athlete.bike.push(new_value);
	console.log('bike ('+row+'): ' + new_value);
	if(new_value.charAt(0) != '-') {
		athlete.times.push(new_value);
	}
}

console.log("");

// Bug workaround
//var fixedHTML = $('.athlete-table-details table').eq(2).children('tbody').html();
//var string2 = fixedHTML.replace(/-->/g, "-->\n");
//$('.athlete-table-details table').eq(2).children('tbody').html(fixedHTML.replace(/-->/g, "-->\n"));
//console.log(string2);
//console.log($('.athlete-table-details table').eq(2).children('tbody').html());

// Check run:
var htmlrun = $('.athlete-table-details table').eq(2).children('tbody').children('tr');
athlete.run = new Array();
for(var row = 0; row < htmlrun.length; row++){
	var new_value = htmlrun.eq(row).children('td').eq(3).html();
	athlete.run.push(new_value);
	console.log('run ('+row+'): ' + new_value);
	if(new_value.charAt(0) != '-'){
		athlete.times.push(new_value);
	} 
}
//console.log('Athlete progress is: ' + athlete.progress);
athletes.push(athlete);

}

// Sort results
athletes.sort(function(a,b) { 
	if(a.times.length < b.times.length) return 1;
	if(b.times.length < a.times.length) return -1;

	if(a.times.length == 0) return 0;

	var asplit = a.times[a.times.length-1].split(':');
	var bsplit = b.times[b.times.length-1].split(':');
	
	if(asplit[0] > bsplit[0]) return 1;
	if(asplit[0] < bsplit[0]) return -1;

	if(asplit[1] > bsplit[1]) return 1;
	if(asplit[1] < bsplit[1]) return -1;

	return 0;
});

// Print leaderboard:

for(var i = 0; i < athletes.length; i++){
	console.log((i+1) + ".) " + athletes[i].name + ", checkpoint: " + athletes[i].times.length + ", time: " + athletes[i].times[athletes[i].times.length-1]);
}