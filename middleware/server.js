
const client = require("./fabric_client_dev");
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

function splitStr(str, seperator) { 
      
   // Function to split string 
   var string = str.split(seperator); 
     
   //console.log(string); 
   return string
} 

app.get('/', function(req, res) {
   // res.sendFile(path.join(__dirname, 'build', 'index.html'));
   console.log("server is running" );
   res.send("send ok");
});

 app.get('/query', (req, res) => {
    console.log("query => " + req.query.fcn + "|args:" + req.query.args );


    client.queryChaincode( req.query.fcn, req.query.args, (data) => {

      //split to array
      arrayStr = splitStr(data, '|'); 

      var obj = new Object();
 
      arrayStr.forEach(element => {
         if(element === ""){
            return;
         }
         //split to instance
         instance = splitStr(element, '?')

         console.log("instance=>", instance)

         obj[instance[0]] = instance[1]
      });
 
      console.log(obj);
      res.send(obj);
    });

 });


 app.get('/queryAll', (req, res) => {
      console.log("queryAll => " + req.query.fcn + " args: " +req.query.args);

      client.queryChaincode( req.query.fcn, req.query.args, (data) => {
         
      let array = JSON.parse(data)   

      // console.log(array[0].key);

      // console.log(array[0].value.amount);

      // var obj = new Object();


      res.send(array);
   });

});

 


 app.post('/invoke', (req, res) => {
    console.log("invoke = ",req.body );

    client.invokeChaincode( req.body.fcn, req.body.args, (responseStatus)=> {
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
