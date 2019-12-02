
const client = require("./fabric_client_dev");
const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 2000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use(express.static(path.join(__dirname, 'build')));

app.get('/', function(req, res) {
   // res.sendFile(path.join(__dirname, 'build', 'index.html'));
   console.log("server is running" );
   res.send("send ok");
});

 app.get('/query', (req, res) => {
    console.log("query => " + req.body.fcn + "|args:" + req.body.args );

    client.queryChaincode( req.body.fcn, req.body.args, (data) => {
        res.send(data);
    });

 });

 app.post('/invoke', (req, res) => {
    console.log("invoke = ",req.body );

    client.invokeChaincode( req.body.fcn, req.body.args, (data)=> {
        res.send(data);
    });

 });

 app.post('/switchAccount', async (req, res) => {
    console.log("switchAccount = ",req.body );

    let data = await client.switchAccount(req.body.org, req.body.user );

    res.send(data);

 });




// app.post('/vote', (req, res) => {
//     console.log("vote", req.body.candidate, req.body.electorate );

//     const {candidate, electorate} = req.body;

//     proxy.vote(candidate, electorate, function (result) {

//         console.log("vote result" , result );
//         res.send(true);
//     });

// });


// app.get('/getIPFSHash', (req, res) => {
//     console.log("getIPFSHash" );
//     proxy.getIPFSHash(function (data) {
//         res.send(data);
//     });
// });

// app.post('/setIPFSHash', (req, res) => {
//     console.log("setIPFSHash" );
//     proxy.setIPFSHash(req.body.hash, function (data) {
//         res.send(data);
//     });
// });


// app.get('/getContractAddress', (req, res) => {
//     console.log("getContractAddress" );
//     proxy.getContractAddress(function (data) {
//         res.send(data);
//     });
// });

// app.get('/getElectorateVoted', (req, res) => {
//     console.log("getElectorateVoted" );
//     proxy.getElectorateVoted(function (data) {
//         res.send(data);
//     });
// });

// app.get('/getCandidates', (req, res) => {
//     console.log("getCandidates" );
//     proxy.getCandidates(function (data) {
//         res.send(data);
//     });
// });

// app.get('/getElectionResult', (req, res) => {
//     console.log("getElectionResult" );
//     proxy.getElectionResult(function (data) {
//         res.send(data);
//     });
// });

app.listen(port,(err) =>{
    if(err)  throw err;
    console.log(`Ready on localhost:${port}`);
});
