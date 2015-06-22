var express = require('express');
var app = express();
var path = require('path');
var aws = require('aws-sdk');

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

aws.config.region = 'eu-west-1';

var ddb = new aws.DynamoDB();
var table = "Demo-Counter";
//
app.get('/', function (req, res) {

    var theme = process.env.THEME || "dark";
    updateCounter(req, res);
    renderCounter(req, res, function(visitors) {
	res.render('index', { visitors: visitors, theme: theme });	
    });
});

function renderCounter(req, res, cb) {
    var params = {
	Key: { 'Id': { N: '1' } },
	TableName: table
    };
    
    ddb.getItem(params, function(err, data) {
	if (err) {
	    console.log(err);
	}
	else {
	    var visitors = data.Item.Visitors.N;
	    cb(visitors);
	}
    });
}

function updateCounter(req, res) {
    var params = {
	Key: { 'Id': { N: '1' } },
	TableName: table
    };
    params.UpdateExpression = 'SET Visitors = Visitors + :p';
    params.ExpressionAttributeValues = {
	    ':p': { N: '1' }
    };
    
    ddb.updateItem(params, function(err, data) {
        if(err) {
	    console.log(err);
	}
    });
}

module.exports = app;
