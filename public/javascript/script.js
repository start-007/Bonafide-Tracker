
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
            let popup=document.getElementById("popup");
            popup.classList.add("open-popup");
            document.getElementById("error").innerHTML=data.message;
            var myList = document.getElementById('studentid');
            myList.innerHTML = '';
            if(data.fine===1){
                document.getElementById("proceed").action="/fine"
                console.log("set to zero");
            }
            else{
                data.studentinformation=(JSON.parse(JSON.stringify(data.studentinformation)));
                console.log(data.studentinformation);
                document.getElementById("proceed").action="/save";
                var listView=document.getElementById("studentid");
                for (var key of Object.keys(data.studentinformation)) {
                    console.log(key + " -> " + data.studentinformation[key])
                    var listViewItem=document.createElement('li');
                    listViewItem.appendChild(document.createTextNode(key+" : "+data.studentinformation[key]));
                   
                    listView.appendChild(listViewItem);
                }
                console.log("ok");
            }
        
            
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
    console.log(srollno,spurpose);
    let myerror = false;
    if(srollno.length !=10  || !srollno.includes("SS") || !srollno.includes("A0")){
        myerror=true;
    }
    if(myerror){
        document.getElementById("error").innerHTML="Enter correct roll number";
    }
    else{
        const route=document.getElementById("proceed").action;
        fetch(route, {
   
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
            console.log(data);
            if(data.fine){
                document.getElementById("error").innerHTML=data.message;
            }
            else{
                window.open("/loadedform/"+srollno+"/"+spurpose,"_self");
            }
            
           
        })
        .catch(console.log(console.error));

        
    }    
});

const closePopup=()=>{
    popup.classList.remove("open-popup");
}
