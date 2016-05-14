
// Example page:
// http://track.ironman.com/newathlete.php?rid=727828834298&race=texas&bib=1&v=3.0&beta=&1463240700 - 2016 Results: IRONMAN North American Championship

var cheerio = require('cheerio');
var request = require('urllib-sync').request;

var raceid = 727828834298;
//var waitTime = 300; // in ms
var verbose = false;
var maxBIB = 110;
var connectionRetries = 8;

var athletes = new Array();

// --- SCRAPE DATA LOOP ---
for (var bib = 1; bib <= maxBIB; bib++) {

	var athlete = {};
	athlete.times = new Array();

	if(verbose) console.log("Checking athlete: " + bib);

	// --- Connect & Download ---
	var options = {
	  method: 'GET',
	  agent: 'Mozilla/5.0',
	};

	var htmldata = "";
	for (var i = 1; i <= connectionRetries; i++) {
		try{
			htmldata = request('http://track.ironman.com/newathlete.php?rid='+raceid+'&bib='+bib+'&v=3.0').data.toString();
		} catch(e) {
			console.log("Connection-Error trying ID " + bib + ".");
			continue;
		}
		if(i > 1) console.log("Got ID " + bib + " on " + i + "th try.");
		break;
	}
	if(htmldata=="") {
		console.log("Giving up on ID " + bib + ". Skipping...");
		continue;
	}
	var $ = cheerio.load(htmldata);

	// --- Get name or skip on error ---
	try{
	athlete.name = $('.eventResults .moduleContentOuter .moduleContentInner section header h1').html().split('>')[3];
	if(verbose) console.log('Name: ' + athlete.name);
	} catch(e) {
		console.log("Error trying ID " + bib + ". (Non-existent?) Skipping...");
		continue;
	}

	// ---- SWIMMING ---
	athlete.swim = $('.athlete-table-details tfoot tr td').eq(3).children('strong').html();
	if(athlete.swim.charAt(0) != '-')  {
		athlete.times.push(athlete.swim);
	}

	if(verbose) console.log('Swim: ' + athlete.swim);
	if(verbose) console.log("");

	// --- BIKE ---
	var htmlbike = $('.athlete-table-details table').eq(1).children('> tr');
	athlete.bike = new Array();
	for(var row = 0; row < htmlbike.length; row++){
		var new_value = htmlbike.eq(row).children('td').eq(3).html();
		athlete.bike.push(new_value);
		if(verbose) console.log('bike ('+row+'): ' + new_value);
		if(new_value.charAt(0) != '-') {
			athlete.times.push(new_value);
		}
	}

	if(verbose) console.log("");

	// --- RUN ---
	var htmlrun = $('.athlete-table-details table').eq(2).children('tbody').children('tr');
	athlete.run = new Array();
	for(var row = 0; row < htmlrun.length; row++){
		var new_value = htmlrun.eq(row).children('td').eq(3).html();
		athlete.run.push(new_value);
		if(verbose) console.log('run ('+row+'): ' + new_value);
		if(new_value.charAt(0) != '-'){
			athlete.times.push(new_value);
		}
	}

	athletes.push(athlete);
}

// --- Sort results ---
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

	if(asplit.length < 3 || bsplit.length < 3) return 0;

	if(asplit[2] > bsplit[2]) return 1;
	if(asplit[2] < bsplit[2]) return -1;

	return 0;
});

// --- Print leaderboard ---
for(var i = 0; i < athletes.length; i++){
	console.log((i+1) + ".) " + athletes[i].name + ", checkpoint: " + athletes[i].times.length + ", time: " + athletes[i].times[athletes[i].times.length-1]);
}
