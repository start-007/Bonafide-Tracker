
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const ejs = require("ejs");
const mongoose=require("mongoose");
const session=require("express-session");
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");
const findOrCreate=require("mongoose-findorcreate");
const path=require("path");
const cors=require("cors");


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

mongoose.connect("mongodb://localhost:27017/bonafideDB",{useNewUrlParser:true});

const openedSchema=new mongoose.Schema({
  rollno:"String",
  name:"String",
  phonenumber:"String",
  purposes:[
    {
      purposename:"String",
      requestdate:"Date",
      issueddate:"Date",
      isissued:"Number"
    }
  ],
  department:"String",
  year:"String"
});

const adminSchema=new mongoose.Schema({
  username:"String",
  password:"String"
})
// adminSchema.plugin(passportLocalMongoose);

const Open=new mongoose.model("Open",openedSchema);
const Admin=new mongoose.model("Admin",adminSchema);


// adminSchema.plugin(findOrCreate);

// passport.use(Admin.createStrategy());

// passport.serializeUser(Admin.serializeUser());
// passport.deserializeUser(Admin.deserializeUser());

///////////////////////////////////////////////Routes/////////////////////////////////////////////

app.get("/",(req,res)=>{
  res.render("home");
});



app.post("/",(req,res)=>{
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();

  today = mm + '/' + dd + '/' + yyyy;
  console.log(req.body);
  const studrollno=req.body.rollno;
  const studname=req.body.name;
  const studphonenumber=req.body.phonenumber;
  const studpurpose={
    purposename: req.body.purpose,
    requestdate:today,
    isissued:0
  }
  const studdepartment=req.body.department;
  const studyear=req.body.year;
  Open.findOne({rollno:studrollno},(err,stud)=>{
    var msg="";
    if(err){
      console.log(err);
    }
    else if(!stud){

      const studentInfo={
        rollno:studrollno,
        name:studname,
        phonenumber:studphonenumber,
        purposes:[studpurpose],
        department:studdepartment,
        year:studyear

      }
      const student = new Open(studentInfo);
      student.save(function (err) {
        if (err) return handleError(err);
        else console.log("Student saved ");
       
      });
      msg="Successfully saved";
    }
    else{

      const mypurposes=stud.purposes;
      var canpush=true;
      mypurposes.forEach(purpose => {
        if(purpose.purposename===req.body.purpose){
          console.log("You have already made the request for this");
          msg+="You have already made the request for this"
          if(purpose.isissued==1){
            console.log("Also since it is issued.You have to pay the fine if you want it again");
            msg+="Also since it is issued.You have to pay the fine,if you want it again";
          }
          canpush=false;
        }
      });
      if(canpush){
        stud.purposes.push(studpurpose);
        stud.save((err)=>{
          if(err) console.log(err);
          else console.log("successfully updated");
        })
        msg="successfully updated";
      }

    }
    console.log(msg);
    res.send({message:msg});
  })

      
});

app.get("/admin",(req,res)=>{
  res.render("adminpage",{Message:"Enter the details"});
})

app.post("/admin",(req,res)=>{

  Admin.findOne({username:req.body.adminid},(err,admin)=>{

    if(err){
      console.log(err);
    }
    else if(!admin){
      res.render("adminpage",{Message:"The details entered by you are incorrect or you are not the admin"});
    }
    else{
      console.log(admin.password);
      if(admin.password===req.body.password){
        res.redirect("/admin/requests/opened");
      }
      else{
        res.render("adminpage",{Message:"Entered password is incorrect"});
      }
    }

  })
});


app.get("/admin/requests/:typeofreq",(req,res)=>{
  Open.find({},(err,openreqs)=>{

    if(err){
      console.log();
    }
    else{
      const type=(req.params.typeofreq==="opened")?0:1;
      var count=[];
      for(var i=0;i<openreqs.length;++i){
        var c=0;
        for(var j=0;j<openreqs[i].purposes.length;++j){
          if(openreqs[i].purposes[j].isissued===0){
            c++;
          }
        }
        count.push(c);
      }
      console.log(count);
      res.render("requests",{Requests:openreqs,Value:type,CountArr:count});
    }

  })
});

app.post("/admin/request/issued",(req,res)=>{
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();

  today = mm + '/' + dd + '/' + yyyy;
  const value=req.body.submitbutton;
  const myrollno=value.substring(0, value.indexOf(' ')); 
  const mypurpose=value.substring(value.indexOf(' ') + 1); 
  console.log(myrollno);
  console.log(mypurpose);
  Open.findOne({rollno:myrollno},(err,stud)=>{
    if(err){
      console.log(err);
    }
    else{
      stud.purposes.forEach((purpose)=>{
        if(purpose.purposename===mypurpose){
          purpose.issueddate=today;
          purpose.isissued=1;
          console.log("may be");
        }
      });
      stud.save((err)=>{
        if(err) console.log(err);
        else console.log("successfully issued");
      })
      res.redirect(req.get('referer'));
    }
  })

});

app.listen(PORT,()=>{
  console.log("listening at "+ PORT);
});




