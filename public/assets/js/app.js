console.log("Linking...app.js");
$( document ).ready(function() {
   let thisId;
   let parentLi;
   let thisNote;
   let noteId;
$("#scraped").on("click", function() {
    $.ajax({
        method: "GET",
        url: "/scrape",
    }).done(function(data) {
        console.log(data)
        window.location.reload(true);
    })
});

$(".saveArticle").on("click", function(event) {
    thisId = $(this).attr("data-id");
    parentLi = $(event.target).parent("li");
    
    $.ajax({
        method: "POST",
        url: "/saved/" + thisId,
        
    }).then(function(data) {
        console.log("saved");
        console.log(data);
        parentLi.empty();
    })
});

$(".deleteArticle").on("click", function(event) {
    thisId = $(this).attr("data-id");
    parentLi = $(event.target).parent("li");
    $.ajax({
        method: "POST",
        url: "/unsaved/" + thisId,
        
    }).then(function(data) {
        console.log("removed");
        console.log(data);
        parentLi.empty();
        
    });
});

$("#saved").on("click", function() {
    
    $.ajax({
        method: "GET",
        url: "/savedArticles"
        
    }).done(function(data) {
        console.log("saved Articles button");
       window.location="/savedArticles";
    })
});



$(".openNotes").on('click',(event)=>{
    
    thisNote =$(event.target).attr("data-id");
    
    sessionStorage.thisNote = thisNote;
    
    console.log("thisNote data-id: " + thisNote);
    $.ajax({
        method: "GET",
        url: "/savedNotes/"+thisNote
    })
    .then((data)=>{
        console.log(JSON.stringify(data, null, 4));
        console.log(data.note);
        
         if (!data.note){
             console.log("else no data.note");
           $("#notesTaken").html("");
           $("#modalTitle").html("");
           $("#inpT").attr("placehoder","Enter Note title");
           $("#inpB").attr("placehoder","Enter Note");
            //return;
        }
        if(data.note){
        noteId = data.note._id;
        sessionStorage.noteId = noteId;
        console.log("OpenNotes: " + data);
        $("#inpT").val("");
        $("#inpB").val("");
        $("#modalTitle").text(data.note.title);
        $("#notesTaken").text(data.note.body);
        }
////////////////////////////////
$(".deleteNote").on("click",()=>{
    console.log("noteId: " + noteId);
    noteId = sessionStorage.noteId;
    thisNote = sessionStorage.thisNote;
    $.ajax({
        method: "DELETE",
        url: "/delete/" + noteId + "/" + thisNote,
        
    }).then((data)=>{
        console.log("deleting notes " +data);
        $(".modal").modal("hide");
        $("#notesTaken").html("");
        $("#modalTitle").html("");
    })
    

})       
///////////////////////////////

        $(".takeNote").on("click", ()=>{
           
         
           thisNote = sessionStorage.thisNote;
            $.ajax({
                method: "POST",
                url: "/notes/" + thisNote,
                data:{
                    title: $(".titleInput").val(),
                    body: $(".bodyInput").val()
                }
            })
            .then((data)=>{
                console.log("takeNote: /notes/" + thisNote + ' '+ data.note.title);
            })
                $(".modal").modal("hide");
               
            
        })
        
        
    })
})
// $(".deleteNote").on("click",()=>{
//     console.log("noteId: " + noteId);
//     noteId = sessionStorage.noteId;
//     thisNote = sessionStorage.thisNote;
//     $.ajax({
//         method: "POST",
//         url: "/delete/" + noteId + "/" + thisNote,
        
//     }).then((data)=>{
//         console.log("deleting notes " +data);
//         $(".modal").modal("hide");
//         $("#notesTaken").html("");
//         $("#modalTitle").html("");
//     })
    

// })
//end of doc ready
});