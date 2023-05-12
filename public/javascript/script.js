function yesnoCheck(that) {
    
    if (that.value == "Other") {
        document.getElementById("ifYes").style.display = "block";
        console.log("working");
    }
    else{
        document.getElementById("ifYes").style.display = "none";
    }
}
document.getElementById("submit").addEventListener("click",(e)=>{
    e.preventDefault();   
    var srollno = document.getElementById('rollno').value;
    var spurpose = document.getElementById('purposemenu').value;
    srollno = srollno.toUpperCase();
    
    let myerror = false;
    if(spurpose=="Other"){
        spurpose=document.getElementById("Other").value;
    }
    console.log(srollno,spurpose);

    if(myerror){
        let i = document.getElementById("prompt"); 
        i.innerHTML="Enter correct roll number";
        i.classList.add("error-msg");
    }
    else{
        fetch("/getdata", {
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
            let i = document.getElementById("prompt"); 
            i.innerHTML="Fill the Details";
            i.classList.remove("error-msg");
            let popup=document.getElementById("popup");
            popup.classList.add("open-popup");
            document.getElementById("error").innerHTML=data.message;
           // document.getElementById("prompt").innerHTML=data.message;
            var myList = document.getElementById('studentid');
            myList.innerHTML = '';
            if(data.proceed){
                document.getElementById("submitbtn").disabled=true;
                document.getElementById("submitbtn").style.visibility = "hidden";
            }
            else{
                document.getElementById("submitbtn").disabled=false;
                document.getElementById("submitbtn").style.visibility = "visible";
            }
            
            data.studentinformation=(JSON.parse(JSON.stringify(data.studentinformation)));
            console.log(data.studentinformation);
            document.getElementById("proceed").action="/getform";
            var listView=document.getElementById("studentid");
            for (var key of Object.keys(data.studentinformation)) {
                console.log(key + " -> " + data.studentinformation[key])
                var listViewItem=document.createElement('li');
                listViewItem.appendChild(document.createTextNode(key+" : "+data.studentinformation[key]));
                
                listView.appendChild(listViewItem);
            }
            console.log("ok");
        
        
            
        })
        .catch(console.log(console.error));

        
        
    }    
})

document.getElementById("submitbtn").addEventListener("click",(e)=>{
    console.log("clicked proceed button");
    e.preventDefault();   
    let srollno = document.getElementById('rollno').value;
    let spurpose = document.getElementById('purposemenu').value;
    srollno = srollno.toUpperCase();
    if(spurpose=="Other"){
        spurpose=document.getElementById("Other").value;
    }
    console.log(srollno,spurpose);
    let myerror = false;
  
    if(myerror){
        let i = document.getElementById("prompt"); 
        i.innerHTML="Enter correct roll number";
        i.classList.add("error-msg");
    }
    else{
        const route=document.getElementById("proceed").action;
        
        window.open("/getform/"+srollno+"/"+spurpose+"/ORIGINAL","_self");
        

        
    }    
});

const closePopup=()=>{
    popup.classList.remove("open-popup");
}

//ï»¿19SS1A0401