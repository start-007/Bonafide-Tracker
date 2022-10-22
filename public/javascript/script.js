
document.getElementById("submit").addEventListener("click",(e)=>{
    e.preventDefault();   
    let srollno = document.getElementById('rollno').value;
    let spurpose = document.getElementById('purposemenu').value;
    srollno = srollno.toUpperCase();
    console.log(srollno,spurpose);
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
                purpose:spurpose,
            })
        }).then(function(response) {
            console.log(response);
            return response.json();
        }).then(function(data){
            if(data.fine){
                document.getElementById("proceed").disabled=false;
            }
            else{
                document.getElementById("proceed").disabled=true;
            }
            document.getElementById("error").innerHTML=data.message;
            console.log(data);
        })
        .catch(console.log(console.error));

        
        
    }    
})

document.getElementById("proceed").addEventListener("click",(e)=>{
    e.preventDefault();   
    let srollno = document.getElementById('rollno').value;
    let spurpose = document.getElementById('purposemenu').value;
    
    srollno = srollno.toUpperCase();
    console.log(srollno,spurpose);
    let myerror = false;
    if(srollno.length !=10  || !srollno.includes("SS") || !srollno.includes("A0")){
        myerror=true;
    }
    if(myerror){
        document.getElementById("error").innerHTML="Enter correct roll number";
    }
    else{
        fetch("/fine", {
   
            method: "POST",
            
            headers: {
                
                'Content-Type': 'application/json',
                
            },
            body: JSON.stringify({
                rollno:srollno,     
                purpose:spurpose,
                
            })
        }).then(function(response) {
            console.log(response);
            return response.json();
        }).then(function(data){
            if(data.fine){
                document.getElementById("proceed").disabled=false;
            }
            else{
                document.getElementById("proceed").disabled=true;
            }
            document.getElementById("error").innerHTML=data.message;
            console.log(data);
        })
        .catch(console.log(console.error));

        
        
    }    
})


