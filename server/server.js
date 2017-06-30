'use strict'

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const Issue = require('./issue.js');
const path = require('path');

app.use(express.static('static'));
app.use(bodyParser.json());


app.get('/api/issues', (req, res) => {
	const filter = {};
	if (req.query.status) filter.status = req.query.status;
	if (req.query.effort_lte || req.query.effort_gte) filter.effort = {};
	if (req.query.effort_lte) {
		filter.effort.$lte = parseInt(req.query.effort_lte, 10) }
	if (req.query.effort_gte) {
		filter.effort.$gte = parseInt(req.query.effort_gte, 10)} ;


	db.collection('issues').find(filter).toArray().then(issues => {
		const metadata = { total_count: issues.length };
		res.json({ _metadata: metadata, records: issues});
	}).catch(error => {
		console.log(error);
		res.status(500).json({ message: `Internal Server Error: ${error}` });
	});
});


app.post('/api/issues', (req, res) => {
	const newIssue = req.body;
	newIssue.created = new Date();

	if(!newIssue.status)
		newIssue.status = 'New';

	const err = Issue.validateIssue(newIssue)
	if (err) {
		res.status(422).json({message: `Invalid request: ${err}`});
		return;
	}

	db.collection('issues').insertOne(Issue.cleanupIssue(newIssue)).then(result =>
		db.collection('issues').find({ _id: result.insertedId }).limit(1).next()
	).then(newIssue => {
		res.json(newIssue);
	}).catch(error => {
		console.log(error);
		res.status(500).json({ message: `Internal Server Error: ${error}` });
	});

});

app.get('/api/issues/:id', (req,res) => {
	let issueId;
	try {
		issueId = new ObjectId(req.params.id);
	} catch (error) {
		res.status(422).json({message: `Invalid issue Id format: ${error}` });
		return;
	}

	db.collection('issues').find({ _id: issueId }).limit(1)
	.next()
	.then(issue => {
		if (!issue) res.status(404).json({ message: `No such issue: ${issueId}` });
		else res.json(issue);
	})
	.catch( error => {
		console.log(error);
		res.status(500).json({ message: `Internal Server Error: ${error}` });
	});

});



app.get('*', (req, res) => {
	res.sendFile(path.resolve('static/index.html'));
});


let db;
MongoClient.connect('mongodb://localhost/issuetracker').then(connection => {
	db = connection;
	app.listen('3000', () => {
		console.log('App started on port 3000')
	});

}).catch(error => {
	console.log('ERROR:', error);
});




