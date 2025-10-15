const btn = document.getElementById("autosave_btn");
const stored = localStorage.getItem("autosave");
var value;
if (stored) {value = JSON.parse(stored);}
else {value = true;}

function setClass() {
    btn.className = `toggle ${value ? "on" : "off"}`;
    btn.textContent = value ? "ON" : "OFF";
}

setClass();
btn.addEventListener("click", () => {
   value = !value;
   localStorage.setItem("autosave", JSON.stringify(value));
   setClass();
});


const header_btns = document.querySelectorAll(".heading");
header_btns.forEach(btn => btn.addEventListener("click", () => {
    document.querySelectorAll(".sub_div").forEach(div => {
        if (div.id ===  btn.id.split("_head")[0]) {div.style.display = "inline";} 
        else {div.style.display = "none";}
    });
    header_btns.forEach(btn2 => {
        if (btn === btn2) {
            btn2.style.fontSize = "20px";
            btn2.style.color = "blue";
        } 
        else {
            btn2.style.fontSize = "16px";
            btn2.style.color = "black";
        }
    });
}));

document.getElementById("alert_btn").addEventListener("click", () => {
    document.querySelector(".alert").style.display = "none";
});


console.log("universal.js loaded");