
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

app.get('/get', (req, res) => {
   console.log("query => " + req.query.fcn + "|args:" + req.query.args );

   if("getPeer" === req.query.fcn){
      client.getPeer( data => {

            console.log(data);
            res.send(data);
          }); 
   }
   else if("getPeers" === req.query.fcn){
      client.getPeers( data => {

      //   console.log(data);
         res.send(data);
       }); 
   }
});

app.post('/post', async (req, res) => {
   console.log("switchAccount = ",req.body.params );
   let data ;
   if("switchAccount" == req.body.params.fcn){
      data = await client.switchAccount(req.body.params.args[0], req.body.params.args[1], req.body.params.args[2]);
   }

   res.send(data);

});

/*chaincode*/
 app.get('/query', (req, res) => {
    console.log("query => " + req.query.fcn + "|args:" + req.query.args );

      client.queryChaincode( req.query.fcn, req.query.args, (responseStatus, err) => {
         
      if(err){
         return res.status(500).json({
            message: responseStatus,
            })
         } 
         res.send(responseStatus);
   

    });
 });
/*chaincode*/
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

app.listen(port,(err) =>{
    if(err)  throw err;
    console.log(`Ready on localhost:${port}`);
});
