db = new Mongo().getDB('issuetracker');

db.issues.remove({});

db.issues.insert([
	{
	id: 1, status:'Open', owner:'Ravan',
	created: new Date('2016-08-15'), 
	effort: 5, completionDate: undefined,
	title: 'Error in Console when clicking Add',
	},
	{
	id: 2, status: 'Assigned', owner: 'Eddie', 
	created: new Date('2016-08-16'), effort: 14, 
	completionDate: new Date('2016-08-30'),
	title: 'Missing bottom border on panel',
	},
]);

db.issues.createIndex({ status: 1});
db.issues.createIndex({ owner: 1});
db.issues.createIndex({ created: 1});

db.close();