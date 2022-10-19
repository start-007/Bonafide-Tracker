
const express = require("express");
const app = express();
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const session=require("express-session");
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");
const findOrCreate=require("mongoose-findorcreate");


const PORT=process.env.PORT || 3000; 

app.use(express.static("/public"));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
   extended: true
 }));



////////////////////////////////////////MongoDB/////////////////////////////////////////////////////

mongoose.connect("mongodb://localhost:27017/bonafideDB",{useNewUrlParser:true});

const openedSchema=new mongoose.Schema({
  rollno:"String",
  name:"String",
  phonenumber:"String",
  purposes:["String"],
  department:"String",
  year:"String"
});

const closedSchema=new mongoose.Schema({
  rollno:"String",
  name:"String",
  phonenumber:"String",
  purposes:["String"],
  department:"String",
  year:"String"
});

const Open=new mongoose.model("Open",openedSchema);
const Close=new mongoose.model("Close",closedSchema);



///////////////////////////////////////////////Routes/////////////////////////////////////////////

app.get("/",(req,res)=>{
  res.render("home");
});

app.post("/",(req,res)=>{

  const studrollno=req.body.rollno;
  const studname=req.body.name;
  const studphonenumber=req.body.phonenumber;
  const studpurpose=req.body.purpose;
  const studdepartment=req.body.department;
  const studyear=req.body.year;
  Close.findOne({rollno:studrollno},(err,student)=>{
    if(err){
      console.log(err);
    }
    else if(!student){
      const stud = new Open({ 
        rollno:studrollno,
        name:studname,
        phonenumber:studphonenumber,
        purposes:[studpurpose],
        department:studdepartment,
        year:studyear
      });
      stud.save(function (err) {
        if (err) return handleError(err);
        else console.log("successfully saved");
      });
    }
    else{
      const purposes=student.purposes;
      purposes.forEach(purpose => {
        if(purpose===studpurpose){
          console.log("you have to pay fine ra idiot");
        }
      });
    }
  });
});

app.listen(PORT,()=>{
  console.log("listening at "+ PORT);
});