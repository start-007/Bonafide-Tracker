
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const ejs = require("ejs");

const { prependListener } = require('process');
const fs = require('fs');
const path=require("path")
const { parse } = require("csv-parse");
const { log } = require('console');



//const session = require('express-session');
//const MongoStore = require('connect-mongo')(session);

const PORT=process.env.PORT || 3000; 

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));


app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, 'public')));

////////////////////////////////////////Login Routes////////////////////////////////////////////////
app.get("/login",(req,res)=>{
  res.render("adminpage",{Message:"Enter the Details"});
});

app.get("/loginerror",(req,res)=>{
  res.render("adminpage",{Message:"The Username or Password is incorrect!"});
});

app.post("/login",(req,res)=>{
  
});

app.get("/changepassword",(req,res)=>{
 
})

app.post('/changepassword', function (req, res) {
 
});




///////////////////////////////////////////////Routes/////////////////////////////////////////////

app.get("/",(req,res)=>{
  res.render("home");
  
});



app.get("/getform/:rollno/:purpose/:type",(req,res)=>{
 
  console.log(req.params);
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();
  today = dd+ '/' + mm + '/' + yyyy;
  const studrollno=req.params.rollno;
  const data = []
  fs.createReadStream("test.csv")
  .pipe(parse({ delimiter: ',' }))
  .on('data', (r) => {
    if(r[0]==studrollno){
      res.render("form",{
        Type:req.params.type,
        Rollno:req.params.rollno.toUpperCase(),
        Date:today,
        Year:r[4],
        Name:r[1],
        Sonordaughterof:r[3],
        Department:r[2],
        Purpose:req.params.purpose.toUpperCase()
      })
    }      
  })
  .on('end', () => {
    
  })
})





app.post("/getdata",(req,res)=>{
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();
  today = dd+ '/' + mm + '/' + yyyy;
  const studrollno=req.body.rollno;
  const data = []
  fs.createReadStream("test.csv")
  .pipe(parse({ delimiter: ',' }))
  .on('data', (r) => {
    data.push(r)
  })
  .on('end', () => {
    var flag=true
    data.forEach((r)=>{
      if(r[0]==studrollno){
        flag=false
        const studentInfo={
          rollno:studrollno,
          name:r[1],
          sonordaughterof:r[3],
          // phonenumber:r[4],
          purpose:req.body.purpose,
          date:today,
          department:r[2],
          year:r[4],
          batch:r[5]
          
        } 
        res.send({
          message:"Verified the Details: Proceeding to the form",
          studentinformation:studentInfo,
          fine:0
        });
      }
       
    })
    
    if(flag){
      res.send({
        message:"Student Entry not saved",
        proceed:1
      })
    }
  })
 
})



app.listen(PORT,()=>{
  console.log("listening at "+ PORT);
});


