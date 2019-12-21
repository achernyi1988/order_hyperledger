
const client = require("./fabric_client_net");
const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 2000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



app.use(express.static(path.join(__dirname, 'build')));

app.use(function (req, res, next) {

   // Website you wish to allow to connect
   res.setHeader('Access-Control-Allow-Origin', '*');
   res.setHeader('Access-Control-Allow-Headers', '*');
   
  // express.static(path.join(__dirname, 'build'))
  next()
})

app.get('/', function(req, res) {
   // res.sendFile(path.join(__dirname, 'build', 'index.html'));
   console.log("server is running" );
   res.send("send ok");
});

 app.get('/query', (req, res) => {
    console.log("query => " + req.query.fcn + "|args:" + req.query.args );

      client.queryChaincode( req.query.fcn, req.query.args, (data) => {

      console.log(data);
      res.send(JSON.parse(data));
    });
 });

 app.post('/invoke', (req, res) => {
    console.log("invoke = ",req.body );

    client.invokeChaincode( req.body.fcn, req.body.args, (responseStatus, err)=> {

      console.log("responseStatus: ",responseStatus )
       if(err){
         return res.status(500).json({
            message: responseStatus,
          })
       } 
      
       res.send({status:responseStatus});
       
    });

 });

 app.post('/switchAccount', async (req, res) => {
    console.log("switchAccount = ",req.body );

    let data = await client.switchAccount(req.body.org, req.body.user );
   
    res.send(data);

 });

app.listen(port,(err) =>{
    if(err)  throw err;
    console.log(`Ready on localhost:${port}`);
});
