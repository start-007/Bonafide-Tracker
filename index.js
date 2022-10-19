const express = require("express");
const app = express();
const ejs = require("ejs");
const bodyParser = require("body-parser");

const PORT=process.env.PORT || 3000; 

app.use(express.static("/public"));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
   extended: true
 }));


app.get("/",(req,res)=>{
  res.render("home");
})

app.listen(PORT,()=>{
  console.log("listening at "+ PORT);
})