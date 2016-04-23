document.querySelector("#enterBtn").addEventListener("click", function(){
    var gameID = document.querySelector("#gameName").value;
    if (gameID.length > 0)
        window.location.href = window.location.protocol + "//" + window.location.host + "/play/" + gameID;
});
