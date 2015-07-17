var express = require('express');
var app = express();
var bodyParser = require('body-parser');

var jsonParser = bodyParser.json({limit:'5mb'});
var urlencodedParser = bodyParser.urlencoded({limit:'5mb',extended:false});

app.use('/docent',express.static(__dirname + '/public/docent'));


var port = 6061;
app.listen(port,function(){
	console.log('server@'+port);
});
