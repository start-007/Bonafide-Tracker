
document.getElementById("submit").addEventListener("click",(e)=>{
    e.preventDefault();   
    let srollno = document.getElementById('rollno').value;
    let sname = document.getElementById('name').value;
    let sphoneno = document.getElementById('phno').value;
    let spurpose = document.getElementById('purposemenu').value;
    let syear = document.getElementById('yearmenu').value;
    let sdept = document.getElementById('deptmenu').value;

    srollno = srollno.toUpperCase();
    console.log(srollno,sname,sphoneno,spurpose,syear,sdept);
    let myerror = false;
    if(srollno.length !=10  || !srollno.includes("SS") || !srollno.includes("A0")){
        myerror=true;
    }
    if(myerror){
        document.getElementById("error").innerHTML="Enter correct roll number";
    }
    else{
        fetch("/", {
   
            method: "POST",
            
            headers: {
                
                'Content-Type': 'application/json',
                
            },
            body: JSON.stringify({
                rollno:srollno,
                name:sname,
                phonenumber:sphoneno,
                purpose:spurpose,
                department:sdept,
                year:syear
            })
        }).then(function(response) {
            console.log(response);
            return response.json();
        }).then(function(data){
            document.getElementById("error").innerHTML=data.message;
            console.log(data);
        })
        .catch(console.log(console.error));

        
        
    }    
})

