 prompt("hello");
document.getElementById("submit").addEventListener("click",(e)=>{
    e.preventDefault();   
    let rollno = document.getElementById('rollno').value;
    let name = document.getElementById('name').value;
    let phoneno = document.getElementById('phno').value;
    let purpose = document.getElementById('purposemenu').value;
    let year = document.getElementById('yearmenu').value;
    let dept = document.getElementById('deptmenu').value;

    rollno = rollno.toUpperCase();
    let error = false;
    if(rollno.length !=10  || !rollno.includes("SS") || !rollno.includes("A0")){
        error=true;
    }
    if(error){
        document.getElementById("error").innerHTML="Enter correct roll number";
    }
    else{
        console.log(rollno);
        console.log(name);
        console.log(phoneno);
        console.log(purpose);
        console.log(year);
        console.log(dept);
        document.getElementById("error").innerHTML="Successfully submitted";
    }    
})

