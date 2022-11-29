
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const ejs = require("ejs");
const mongoose=require("mongoose");
//const session=require("express-session");
var session = require('cookie-session');
const passport=require("passport");

const passportLocalMongoose=require("passport-local-mongoose");
const findOrCreate=require("mongoose-findorcreate");
const path=require("path");
const cors=require("cors");

const { MongoClient, ServerApiVersion } = require('mongodb');
const { prependListener } = require('process');
const { rmSync } = require('fs');
const LocalStrategy = require('passport-local').Strategy;


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

app.use(session({
  secret:"Our little secret.",
  resave:false,
  saveUninitialized:false,

}));

app.use(passport.initialize());

app.use(passport.session());

app.use(cors());


////////////////////////////////////////MongoDB/////////////////////////////////////////////////////

// mongoose.connect("mongodb://localhost:27017/bonafidetrackerDB",{useNewUrlParser:true});
const URI=process.env.ATLAS_URI
const client = new MongoClient(URI, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
  const collection = client.db("test").collection("devices");
  console.log(err);
});

mongoose.connect(URI,(err)=>{
  console.log(err);
});

const openedSchema=new mongoose.Schema({
  rollno:"String",
  purposes:[
    {
      purposename:"String",
      dates:[{
        requestdate:"Date",
        issueddate:"Date",
        
      }],
      isissued:"Number"
    }
  ],
});
const finedSchema=new mongoose.Schema({
  rollno:"String",
  purpose:{
      purposename:"String",
      requestdate:"Date",
      issueddate:"Date",
      isissued:"Number",
      paid:"Number",
      fine:"Number"
    },
});
const studentSchema=new mongoose.Schema({
  rollno:"String",
  sonordaughterof:"String",
  name:"String",
  phonenumber:"String",
  department:"String",
  year:"Number"
});

const adminSchema=new mongoose.Schema({
  username:"String",
  password:"String"
})
adminSchema.plugin(passportLocalMongoose);

const Fine=new mongoose.model("Fine",finedSchema);
const Student=new mongoose.model("Student",studentSchema);
const Open=new mongoose.model("Open",openedSchema);
const Admin=new mongoose.model("Admin",adminSchema);


adminSchema.plugin(findOrCreate);

passport.use(Admin.createStrategy());

passport.serializeUser(Admin.serializeUser());
passport.deserializeUser(Admin.deserializeUser());

////////////////////////////////////////Login Routes////////////////////////////////////////////////
app.get("/login",(req,res)=>{
  res.render("adminpage",{Message:"Enter the Details"});
});

app.get("/loginerror",(req,res)=>{
  res.render("adminpage",{Message:"The Username or Password is incorrect!"});
});

app.post("/login",(req,res)=>{
  console.log(req.body.username,req.body.password);
  const admin=new Admin({
    username:req.body.username,
    password:req.body.password
  });

 req.login(admin,(err)=>{
    if(err){
       console.log(err);
    }
    else{
      
       passport.authenticate("local", {failureRedirect:'/loginerror' })(req,res,()=>{
          console.log("in login");
          res.redirect("/");
       });
       
    }
  })
});

app.get("/changepassword",(req,res)=>{
  if(req.isAuthenticated()) {
    res.render("changepassword",{Message:"Enter the Details"});
  }
  else {
    res.redirect("/login");
  }

})

app.post('/changepassword', function (req, res) {
  Admin.findByUsername(req.body.username, (err, admin) => {
      if (err) {
        res.render("changepassword",{Message: "Password or Username is incorrect!"});
      } else if(!admin){
        res.render("changepassword",{Message: "Password or Username is incorrect!"});
      }
      else{
        admin.changePassword(req.body.oldpassword, 
          req.body.newpassword, function (err) {
              if (err) {
                  res.render("changepassword",{Message: "Password or Username is incorrect!"});
              } else {
                  res.render("changepassword",{Message:'Successfully Changed Password'});
              }
          });
      }
  });
});

// app.get("/register",(req,res)=>{
//   res.render("adminpage",{Message:"Enter "})
// })

// app.post("/register",(req,res)=>{
//   console.log(req.body.username,req.body.password);
//   Admin.register({
//     username:req.body.username
//     },req.body.password,(err,user)=>{
//     if(err){
//        console.log(err);
//        res.redirect("/login");
//     }
//     else{
//         console.log("entered");
//         passport.authenticate("local")(req,res,()=>{
//             res.redirect("/");
//         });
       
//     }
// });
// });


///////////////////////////////////////////////Routes/////////////////////////////////////////////

app.get("/",(req,res)=>{
  console.log("in home",req.user);
  if(req.isAuthenticated()){
    res.render("home");
  }
  else{
    console.log("not authenticated in home");
    res.redirect('/login');
  }
  
});



app.post("/getdata",(req,res)=>{
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();
  today = mm + '/' + dd + '/' + yyyy;
  console.log(req.body);
  const studrollno=req.body.rollno;

  Student.findOne({rollno:studrollno},(err,stud)=>{
    var msg="";
    if(err){
      console.log(err);
    }
    else if(!stud){
      res.send({message:"Student Entry is not saved",proceed:1});
    }
    else{
      Open.findOne({rollno:studrollno},(err,mystud)=>{
        if(err){
          console.log(err);
        }
        else if(!mystud){
          console.log("fresh request");
          const studentInfo={
            rollno:studrollno,
            name:stud.name,
            sonordaughterof:stud.sonordaughterof,
            phonenumber:stud.phonenumber,
            purpose:req.body.purpose,
            date:today,
            department:stud.department,
            year:stud.year
          } 
          console.log("in fresh req");
          res.send({
            message:"Verified the Details: Proceeding to the form",
            studentinformation:studentInfo,
            fine:0
          });
        }
        else{
          var issued=false;
          mystud.purposes.forEach(purpose => {
            if(purpose.purposename===req.body.purpose && purpose.isissued===1 ){
              msg="The Request is already made. Since it is issued. The fine of Rs.100 must be paid";
              issued=true;
            }
          });
          if(issued){
            res.send({
              message:msg,
              fine:1,
            });
          }
          else{
            console.log("no match no fine");
            res.send({
              message:"Verified the Details: Proceeding to the form",
              studentinformation:{
                name:stud.name,
                rollno:req.body.rollno,
                sonordaughterof:stud.sonordaughterof,
                purpose:req.body.purpose,
                date:today,
                department:stud.department,
                year:stud.year
              } ,
              fine:0,
            });
          }
          
        }

      })
    }
  })

      
});

app.post("/save",(req,res)=>{
  console.log("In save");
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();
  today = mm + '/' + dd + '/' + yyyy;
  const purpose={
    purposename: req.body.purpose,
    dates:[{
      requestdate:today,
      issueddate:today,
    }],
    isissued:1,
  }
  Open.findOne({rollno:req.body.rollno},(err,opened)=>{
    if(err){
      console.log(err);
    }
    else if(!opened){
      const openreq=new Open({
        rollno:req.body.rollno,
        purposes:purpose,
      })
      console.log(openreq);
      openreq.save((err)=>{
        if(err) console.log(err);
        else console.log("Successfully saved");
      });
      
    }
    else{
      opened.purposes.push(purpose);
      opened.save((err)=>{
        if(err) console.log(err);
        else console.log("Successfully saved");
      });
    }
   
    res.send({message:"Successful"});
     
  });
  
});

app.get("/loadedform/:rollno/:purpose/:type",(req,res)=>{
  if(req.isAuthenticated()){

      var today = new Date();
      var dd = String(today.getDate()).padStart(2, '0');
      var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
      var yyyy = today.getFullYear();
      today = dd + '/' + mm + '/' + yyyy;
      console.log("in form",req.params.rollno,req.params.purpose);
      Student.findOne({rollno:req.params.rollno},(err,stud)=>{

        if(err){
          console.log(err);
        }
        else{
          console.log(stud.department);
          res.render("form",{
            Type:req.params.type,
            Rollno:req.params.rollno.toUpperCase(),
            Date:today,
            Year:stud.year,
            Name:stud.name.toUpperCase(),
            Sonordaughterof:stud.sonordaughterof.toUpperCase(),
            Department:stud.department,
            Purpose:req.params.purpose.toUpperCase()
          })
        }

      });
  }
  else{
    res.redirect("/login");
  }

})



app.post("/fine",(req,res)=>{
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();
  today = mm + '/' + dd + '/' + yyyy;
  console.log("in fine",req.body);
  const studrollno=req.body.rollno;
  const studpurpose={
    purposename: req.body.purpose,
    requestdate:today,
    isissued:0,
    fine:1000,
    paid:0
  }
  Fine.findOne({rollno:studrollno},(err,stud)=>{
    var msg="";
    var fine=1;
    if(err){
      console.log(err);
    }
    else if(!stud){
      const student = new Fine({rollno:studrollno,purpose:studpurpose});
      student.save(function (err) {
        if (err) return handleError(err);
        else console.log("Student saved ");   
      });
      console.log("succesfully saved in fine");
      msg="Successfully saved & Make sure you pay the fine";
      fine=1;
      res.send({message:msg,fine:fine,proceed:1});
    }
    else{
      msg="There is another request to paid. So you can't make a new one until it is paid";
      fine=1;
      res.send({message:msg,fine:fine,proceed:1});
    }
    
  })

})



app.get("/admin/requests/:typeofreq",(req,res)=>{
  if(req.isAuthenticated()){
      const request=req.params.typeofreq;
    if(request==="fined"){

      Fine.find({},(err,fines)=>{
        if(err){
          console.log(err);
        }
        else if(fines.length===0){
          res.render("requests",{Value:0,Requests:fines,Message:"No records"});
        }
        else{
          res.render("requests",{Value:0,Message:"",Requests:fines});
        }

      })
    }
    else{
      
      Open.find({},(err,opened)=>{
        if(err){

        }
        else if(opened.length===0){
          res.render("requests",{Value:1,Requests:opened,Message:"No records"});
        }
        else{
          res.render("requests",{Value:1,Message:"",Requests:opened});
        }

      })

    }

  }
  else{
    res.redirect("/login");
  }
  

  
  
});

app.post("/admin/request/fine/paid",(req,res)=>{
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();
  today = mm + '/' + dd + '/' + yyyy;
  const value=req.body.submitbutton;
  const myrollno=value.substring(0, value.indexOf(' ')); // "72"
  const mypurpose=value.substring(value.indexOf(' ') + 1);
  console.log(myrollno,mypurpose);

  Fine.findOne({rollno:myrollno},(err,fine)=>{
    if(err){
      console.log(err);
    }
    else{
      Open.findOne({rollno:myrollno},(err,stud)=>{
        if(err){
          console.log(err);
        }
        else{
          console.log(stud.purposes.dates);
          stud.purposes.forEach(purpose=>{
            if(purpose.purposename===mypurpose){
              purpose.dates.push({
                requestdate:fine.requestdate,
                issueddate:today
              })
            }
          })
          stud.save((err)=>{
            if(err) console.log(err);
            else console.log("successfully issued in student as fine");
          })
          Fine.deleteOne({rollno:myrollno},(err)=>{
            if(err){
              console.log(err);
            }
            else{
              console.log("deleted");
            }
          })
          res.redirect("/loadedform/"+myrollno+"/"+mypurpose+'/'+'ORIGINAL');
        }

      })
      
    }
  })

});

app.listen(PORT,()=>{
  console.log("listening at "+ PORT);
});


