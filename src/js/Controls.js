function keyDownHandler(e){
    console.log("down", e);
}

function keyUpHandler(e){
    console.log("up", e);
}

function Controls(){
    document.addEventListener("keydown",keyDownHandler, false);
    document.addEventListener("keyup",keyUpHandler, false);
}



module.exports = Controls;
