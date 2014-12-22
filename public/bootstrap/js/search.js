var monk = require('monk');
var db = monk('localhost/mydb');
var places = db.get('places');
var doc;
var query = document.getElementById('search').value;
function ret(err,doc) {console.log(doc);};

function search (err,query,doc) {
	places.find({ a : query},ret);
	alert(doc);
};