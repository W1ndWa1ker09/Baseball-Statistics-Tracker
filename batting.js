function downloadStats() {
    const text = JSON.stringify(stats);
    const blob = new Blob([text], {type: "text/plain"});
    const url = URL.createObjectURL(blob);

    a = document.createElement("a");
    a.href = url;
    a.download = "Ultimate Baseball In-Game Batting Statistics.txt";
    a.click();
    URL.revokeObjectURL(url);
}
function uploadStats(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            stats = JSON.parse(e.target.result);
            calcStats();
            displayStats();
        } catch (err) {
            showAlert("Invalid file format. Upload a different file.");
            data_in.value = "";
        }
    };
    reader.readAsText(file);
}
function saveStatsToLocal() {
    localStorage.setItem("batting_stats", JSON.stringify(stats));
    markSaved();
}
function loadStatsFromLocal() {
    const stored = localStorage.getItem("batting_stats");
    if (stored) {stats = JSON.parse(stored);}
    displayStats();
}
function markSaved() {
    save_btn.className = "toggle on";
}
function markUnsaved() {
    save_btn.className = "toggle off";
}

function checkDivision(dividend, divisor) {
    if (divisor === 0) {return 0}
    else {return(dividend/divisor)}
}
function round(num, digits) {
    const mult = Math.pow(10, digits)
    return Math.round(num*mult)/mult
}
function showAlert(message) { 
    document.getElementById("alert_p").textContent = message;
    alert_div.style.display = 'flex';
}

const save_btn = document.getElementById("save_btn");
const alert_div = document.querySelector(".alert");

const data_in = document.getElementById("data_in");
const data_reset_btn = document.getElementById("data_reset_btn");

var temp = localStorage.getItem("autosave");
var autosave = temp ? JSON.parse(temp) : false;

var stats = {
    pa: 0, ab: 0, tb: 0, h: 0, xbh: 0, o: 0,
    s: 0, d: 0, t: 0, hr: 0, bb: 0, hbp: 0, 
    so: 0, fo: 0, go: 0, roe: 0, fc: 0,
    avg: 0, obp: 0, slg: 0, ops: 0, sbper: 0, babip: 0, soper: 0, bbper: 0,
    r: 0, rbi: 0, sb: 0, cs: 0
};


window.addEventListener("load", loadStatsFromLocal);
window.addEventListener("beforeunload", () => {
    if (autosave) {saveStatsToLocal();}
});
save_btn.addEventListener("click", saveStatsToLocal);
document.getElementById("autosave_btn").addEventListener("click", () => {
    autosave = JSON.parse(localStorage.getItem("autosave"));
});
data_in.addEventListener("change", uploadStats);
document.getElementById("data_btn").addEventListener("click", downloadStats);
data_reset_btn.addEventListener("click", () => {
    data_in.value = "";
    data_reset_btn.style.display = "none";
});



console.log("batting.js loaded");