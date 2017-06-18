const express = require('express');
const bodyParser= require('body-parser');
const app = express();
const MongoClient = require('mongodb').MongoClient

app.set('view engine', 'ejs');
var db;

MongoClient.connect('mongodb://deekshitr:deekshitr123@ds123312.mlab.com:23312/ripples', function(err, database) {
  if (err) return console.log(err)
  db = database
  app.listen(3000, function() {
    console.log('listening on 3000')
  })
})

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


app.get('/', function(req, res) {
   db.collection('trip').find().sort({_id:1}).toArray(function(err, result) {
		    if (err) return console.log(err)
		    res.render('index.ejs', {trips: result});
});
});

app.post('/requestCar', function(req, res) {
	console.log("req",req.body);
	if(req.body.isPink=='on'){
		req.body.isPink=true;
	} else{
		req.body.isPink=false;
	}
	console.log('after',req.body);
   db.collection('trip').save(req.body, function(err, result) {
    if (err){ 
    	return res.send('ride unsuccessfull');
    }
    	else{
    		console.log('result',result);
    		var resData={};
    		var a=Math.pow(result.ops[0].latitude,2)+Math.pow(result.ops[0].latitude,2);
    		var distace=Math.sqrt(a);
    		resData.success='true';
    		resData.distance=distace;
    		resData.tripId=result.ops[0]._id;
    		res.send(resData);
		  }
    	})
  });

app.post('/startTrip', function(req, res) {
	console.log('request',req.body);
   db.collection('trip').findOneAndUpdate({userId:req.query.userId},{$set:{startTime:new Date().getTime()/1000}}, function(err, result) {
    if (err){
     return console.log(err);
 }
    	else{
    		console.log('update result',result);
    		var resData={};
    		resData.success='true';
    		res.send(resData);
    	}

  });
});

app.post('/stopTrip', function(req, res) {
	console.log('request',req.body);
	var stoptime=new Date().getTime()/1000;

   db.collection('trip').findOneAndUpdate({userId:req.query.userId},{$set:{latitude:req.body.latitude,longitude:req.body.longitude,stopTrip:stoptime}}, function(err, result) {
    if (err){
     return console.log(err);
 }
    	else{
    	 db.collection('trip').findOneAndUpdate({userId:req.query.userId},{$unset:{startTime:null}}, function(err, result) {
	
    		
    		console.log('update result',result);
    		var resData={};
    		var a=Math.pow(req.body.latitude,2)+Math.pow(req.body.longitude,2);
    		var distace=Math.sqrt(a);
    		var timeElapsed=stoptime-result.value.startTime;
    		if(result.value.isPink){
    			resData.pinkCharge=5
    			tripFare=2*distace+1*(Math.floor(timeElapsed / 60)+resData.pinkCharge);
    		}	
	    	else{
	    		resData.pinkCharge=0;
	    		tripFare=2*distace+1*(Math.floor(timeElapsed / 60));
	    	}

    		resData.success='true';
    		resData.tripFare=tripFare;
    		resData.timeElapsed=timeElapsed;
    		resData.distance=distace;
    		resData.tripId=result.value._id;
    		res.send(resData);
    	});
    	}

  });
});


