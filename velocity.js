class Session {
    constructor(date, type, velos) {
        this.date = date;
        this.type = type;
        this.velos = velos;
        const stats = getListStats(this.velos);
        this.max = stats[0];
        this.min = stats[1];
        this.avg = stats[2];
        this.eighth_avg = stats[3];
        this.median = stats[4];
        this.std_dev = stats[5];
    }
}
class Stats {
    constructor(sessions, date = null, type = null) {
        if (date === null) {
            this.sessions = sessions;
            this.days = Array.from(new Set(sessions.map(s => s.date))).length;
        } else {
            this.date = date;
            this.type = type;
            this.sessions = sessions.filter(s => (s.date === this.date && s.type === type));
        }
        
        if (this.sessions.length > 0) {
            this.velos = this.sessions.map(s => s.velos).flat()
            const stats = getListStats(this.velos);
            this.max = stats[0];
            this.min = stats[1];
            this.avg = stats[2];
            this.eighth_avg = stats[3];
            this.median = stats[4];
            this.std_dev = stats[5];
        } else {
            this.velos = [];
            this.max = 0;
            this.min = 0;
            this.avg = 0.0;
            this.eighth_avg = 0.0;
            this.median = 0.0;
            this.std_dev = 0.0;
        }
    }
}

function getListStats(input_list) {
    const list = input_list.sort((a, b) => b - a);
    const eighth = Math.round(list.length/8);

    var sum = 0;
    var eighth_sum = 0;
    var max = list[0];
    var min = list[0];
    for (var i = 0; i < list.length; i++) {
        sum += list[i];
        if (list[i] > max) {max = list[i]}
        if (list[i] < min) {min = list[i]}
        if (i < eighth) {eighth_sum += list[i]}
    }
    var avg = sum/list.length;
    var eighth_avg = 0;
    if (eighth > 0) {eighth_avg = eighth_sum/eighth;}

    const mid = Math.floor(list.length/2);
    const median = list.length % 2 !== 0
        ? list[mid]
        : (list[mid-1] + list[mid]) / 2;

    var sq_diffs = 0;
    for (var i = 0; i < list.length; i++){ 
        sq_diffs += Math.pow(list[i] - avg, 2);
    }
    const std_dev = Math.sqrt(sq_diffs/list.length);
       
    return([max, min, avg, eighth_avg, median, std_dev]);
}
function round(num, digits) {
    const mult = Math.pow(10, digits)
    return Math.round(num*mult)/mult
}
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
function checkValidity(date, type, velos) {
    const parts = date.split("/");
    if (
        parts.length !== 3 ||
        parts.some(part => isNaN(part)) ||
        parts[0].length !== 2 ||
        parts[1].length !== 2 ||
        parts[2].length !== 4
    ) {return false;}

    if (!(type === "Pitching" || type === "Hitting" || type === "Swinging")) {return false;}

    if (velos.some(velo => isNaN(velo))) {return false;}

    return true;
}
function createDays() {
    const dates = Array.from(new Set(sessions.map(s => s.date))).sort((a, b) => Date(a) - Date(b));
    var temp_days = [];
    ["Pitching", "Hitting", "Swinging"].forEach(t => {
        dates.forEach(d => temp_days.push(new Stats(sessions, d, t)));
    });
    days = temp_days.filter(d => d.sessions.length > 0);
}
function resetTable() {
    current_sort = {key: null, ascending: true};
    createDays();
    sortSessions(getCurrentData(), "date");
    displayDelSessions();
}
function getCurrentData() {
    return display_days ? days : sessions;
}
function showAlert(message) { 
    document.getElementById("alert_p").textContent = message;
    alert_div.style.display = 'flex';
}

function confirmSession() {
    current_date = session_date_in.value.split("-");
    current_date.push(current_date[0]);
    current_date.splice(0, 1);
    current_date = current_date.join("/");

    current_type = session_type_in.value;

    if (current_date === "") {showAlert("Enter a date to continue.");} 
    else {
        addVelo();

        session_create_div.style.display = "none";
        velo_add_div.style.display = "inline";
    }
}
function finishSession(velo_out) {
    if (velo_out === 0) {
        var velos = [];
        for (var i = 0; i < current_velos.length; i++) {
            var velo = current_velos[i].input.value;
            if (velo !== "") {velos.push(Number(velo));} 
            else {velos.push(0);}
        }
        if (velos.length === 0) {velos = [0]}
        sessions.push(new Session(current_date, current_type, velos));
        resetTable(sessions, "date");
        markUnsaved();
        if (autosave) {saveSessionsToLocal();}
    }

    session_date_in.value = "";
    session_type_in.value = "Pitching";
    velo_div.innerHTML = "";
    current_velos = [];

    session_create_div.style.display = "inline";
    velo_add_div.style.display = "none";

}

function addVelo() {
    const wrapper = document.createElement("div");
    wrapper.style.padding = "2px";

    const label = document.createElement("label");
    const input = document.createElement("input");
    input.type = "Number";
    input.className = "velo_in";
    input.min = "25";
    input.max = "130";

    const button = document.createElement("button");
    button.textContent = "-";
    button.className = "velo_btn";
    const br = document.createElement("br");

    var type = "";
    if (current_type === "Pitching") {type = "Pitch";}
    else if (current_type === "Hitting") {type = "Hit";}
    else if (current_type === "Swinging") {type = "Swing";}
    velo_add_btn.textContent = `Add ${type}`;
    label.textContent = `${type} #${current_velos.length + 1}:`;

    wrapper.append(label, input, button, br);
    velo_div.appendChild(wrapper);
    current_velos.push({wrapper, label, input})

    button.onclick = function () {
        if (current_velos.length > 1) {
            current_velos.splice(current_velos.findIndex(e => e.wrapper === wrapper), 1);
            velo_div.removeChild(wrapper);
            for (var i = 0; i < current_velos.length; i++) {
                current_velos[i].label.textContent = `${type} #${i+1}:`;
            }
        }
    };
    input.addEventListener("change", () => {
        if (Number(input.value) > 130) {input.value = 130}
        if (Number(input.value) < 25) {input.value = 25}
    });
}
function removeAllVelos() {
    for (var i = current_velos.length - 1; i > 0; i--) {
        velo_div.removeChild(current_velos[i].wrapper);
        current_velos.splice(i, 1);
    }
}

function displaySessions(input_sessions) {
    const filtered = sortSessionsByDays(input_sessions);

    const rows = session_tbl.querySelectorAll("tr");
    for (var i = 0; i < rows.length; i++) {
        if (i !== 0) {rows[i].remove();}
    }

    var index = 0;
    var displayed_sessions = [];
    for (var i = 0; i < filtered.length; i++) {
        const session = filtered[i];
        
        if (session_select_in.value === session.type || session_select_in.value === "All") {
            index += 1;
            displayed_sessions.push(session);

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td> ${index} </td>
                <td> ${session.date} </td>
                <td> ${session.type} </td>
                <td> ${session.velos.length} </td>
                <td> ${session.max}mph </td>
                <td> ${session.min}mph </td>
                <td> ${round(session.avg, 2)}mph </td>
                <td> ${round(session.eighth_avg, 2)}mph </td>
                <td> ${round(session.median, 2)}mph </td>
                <td> ${round(session.std_dev, 2)}mph </td>
            `;
            session_tbl.appendChild(tr);
        }
    }

    if (displayed_sessions.length === 0) {
        const tr = session_tbl.insertRow();
        tr.innerHTML = `
            <td> 1 </td>
            <td> N/A </td>
            <td> N/A </td>
            <td> N/A </td>
            <td> N/A </td>
            <td> N/A </td>
            <td> N/A </td>
            <td> N/A </td>
            <td> N/A </td>
            <td> N/A </td>
        `
    }
    const stats = new Stats(displayed_sessions);
    const tr = session_tbl.insertRow(1);
    tr.innerHTML = `
    <td> Total </td>
    <td> ${stats.days} Day${(stats.days!==1)?"s":""} </td>
    <td> ${session_select_in.value} </td>
    <td> ${stats.velos.length} </td>
    <td> ${stats.max}mph </td>
    <td> ${stats.min}mph </td>
    <td> ${round(stats.avg, 2)}mph </td>
    <td> ${round(stats.eighth_avg, 2)}mph </td>
    <td> ${round(stats.median, 2)}mph </td>
    <td> ${round(stats.std_dev, 2)}mph </td>
    `;
    tr.className = "total_tr";

    displayed_data = displayed_sessions;
    drawChart(current_metric);
    return(displayed_sessions);
}
function displayArrows() {
    sort_btns.forEach(btn => {
        if (btn.name === current_sort.key) {
            const arrow = current_sort.ascending ? "🡱" : "🡳";
            btn.textContent = btn.textContent.replace(/[\s🡱🡳]*$/, "") + arrow;
        } else {
            btn.textContent = btn.textContent.replace(/[\s🡱🡳]*$/, "");
        }
    });
}
function sortSessions(input_sessions, key) {
    const auto_descend = ["date", "avg", "eighth_avg", "max", "median", "std_dev"].includes(key);
    if (current_sort.key === key) {
        if ((current_sort.ascending && !auto_descend) || (!current_sort.ascending && auto_descend)) {
            current_sort.ascending = !current_sort.ascending
        }
        else if (!current_sort.ascending || (current_sort.ascending && auto_descend)) {
            current_sort.key = null;
            current_sort.ascending = true;
            displaySessions(input_sessions);
            displayArrows();
            return;
        }
    } else {
        current_sort.key = key;
        current_sort.ascending = true;
        if (auto_descend) {current_sort.ascending = false;}
    }

    const visible_sessions = displaySessions(input_sessions)
        .map((s, i) => ({session: s, index: i}))
        .sort((a, b) => {
            var val_a = a.session[key];
            var val_b = b.session[key];
            if (key === "date") {
                val_a = new Date(val_a);
                val_b = new Date(val_b);
            } else if (key === "totals") {
                val_a = a.velos.length;
                val_b = b.velos.length;
            }
            
            if (val_a < val_b) return current_sort.ascending ? -1 : 1;
            if (val_a > val_b) return current_sort.ascending ? 1 : -1;
            return b.index - a.index;
        })
        .map(o => o.session);

    displaySessions(visible_sessions);
    displayArrows();
}
function sortSessionsByDays(input_sessions) {
    var filtered = input_sessions;
    if (days_filter) {
        var unique_dates = Array.from(new Set(input_sessions.map(s => s.date)));
        unique_dates.sort((a, b) => new Date(b) - new Date(a));
        unique_dates = new Set(unique_dates.slice(0, days_in.value));

        filtered = input_sessions.filter(s => unique_dates.has(s.date));
    }
    return filtered;
}
function drawChart(metric = "Average") {
    if (displayed_data.length === 0) {
        chart_message.style.display = "inline";
        return;
    } 
    else {chart_message.style.display = "none";}

    const data = {};
    for (var session of displayed_data) {
        if (session.velos.length === 0) {continue}

        var value;
        switch (metric) {
            case "Average": value = session.avg; break;
            case "Top 8th Average": value = session.eighth_avg; break;
            case "Median": value = session.median; break;
            case "Standard Deviation": value = session.std_dev; break;
            case "Maximum": value = session.max; break;
            case "Minimum": value = session.min; break;
            case "Total Values": value = session.velos.length; break;
        }
        data[display_days ? session.date : `Session ${displayed_data.indexOf(session)+1}`] = value;
    }

    const labels = Object.keys(data);
    const values = Object.values(data);
    const ctx = document.getElementById("chart").getContext("2d");

    if (chart_instance) chart_instance.destroy();
    chart_instance = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: metric,
                data: values,
                fill: false,
                borderColor: "blue",
                tension: 0.1
            }]
        },
        options: {
            responsive: false,
            mainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}
function displayDelSessions() {
    const table = document.getElementById("delete_tbl");
    const rows = table.querySelectorAll("tr");
    for (var i = 0; i < rows.length; i++) {
        if (i !== 0) {rows[i].remove();}
    }

    var index = 0;
    for (var i = sessions.length - 1; i >= 0; i--) {
        index += 1;
        const session = sessions[i];

        const tr = document.createElement("tr");
        tr.innerHTML = `
        <td> ${index} </td>
        <td> ${session.date} </td>
        <td> ${session.type} </td>
        <td> ${session.velos.length} </td>
        <td> ${session.max} </td>
        <td> ${session.min} </td>
        <td> ${round(session.avg, 2)} </td>
        `;
        const td = document.createElement("td");
        const btn = document.createElement("button");
        btn.textContent = "X";
        btn.className = "delete_btn";
        btn.addEventListener("click", () => {
            sessions.splice(i, 1);
            resetTable();
            displayDelSessions();
            if (autosave) {saveSessionsToLocal();}
        });

        td.appendChild(btn);
        tr.appendChild(td);
        table.appendChild(tr);
    }
}

function downloadSessions() {
    var text = "";
    for (var session of sessions) {
        text += `DATE: ${session.date}\n`;
        text += `TYPE: ${session.type.toUpperCase()}\n`;
        text += session.velos.join("\n") + "\n";
    }

    const blob = new Blob([text], {type: "text/plain"});
    const url = URL.createObjectURL(blob);

    a = document.createElement("a");
    a.href = url;
    a.download = "Ultimate Baseball Velocity Practice Sessions.txt";
    a.click();
    URL.revokeObjectURL(url);
}
function uploadSessions(event) {
    sessions = [];

    const file = event.target.files[0];
    if (!file) {return;}
    if (file.name.split(".").pop() !== "txt") {
        uploadError("The file you uploaded is not a .txt file. Please upload a different file.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const lines = e.target.result.split("\n").map(line => line.trim());

        var i = 0;
        while (i < lines.length) {
            if (lines[i].startsWith("DATE: ") && lines[i+1].startsWith("TYPE: ")) {
                const date = lines[i].split("DATE: ")[1];
                const type = capitalize(lines[i+1].split("TYPE: ")[1]);
                const velos = [];

                i += 2;
                while (i < lines.length && !lines[i].startsWith("DATE: ")) {
                    const num = Number(lines[i])
                    if (num !== 0) {velos.push(num)}
                    i++;
                }

                if (checkValidity(date, type, velos)) {sessions.push(new Session(date, type, velos));}
                else {
                    uploadError("The .txt file you uploaded is in an incorrect format. Please try again.");
                    return;
                }
            } else {
                uploadError("The .txt file you uploaded is in an incorrect format. Please try again.");
                return;
            }
        }

        resetTable();
        markUnsaved();
        if (autosave) {saveSessionsToLocal();}
    }
    reader.readAsText(file);
    data_reset_btn.style.display = "inline";
}
function uploadError(message) {
    showAlert(message);
    data_reset_btn.click();
    return;
}

function saveSessionsToLocal() {
    const data = sessions.map(s => ({
            date: s.date,
            type: s.type,
            velos: s.velos
    }));
    localStorage.setItem("sessions", JSON.stringify(data));

    save_btn.className = "toggle green";
    unsaved = false;
}
function saveSettingsToLocal() {
    const data = {
        default_type: session_select_in.value,
        default_num_days: days_in.value,
        days_filter: days_filter,
        display_days: display_days,
        default_metric: current_metric,
    }
    localStorage.setItem("settings", JSON.stringify(data));
}
function loadSessionsFromLocal() {
    var stored = localStorage.getItem("settings");
    if (stored) {
        const parsed = JSON.parse(stored);

        session_select_in.value = parsed.default_type;
        days_in.value = parsed.default_num_days;
        days_filter = !parsed.days_filter;
        days_btn.click();
        display_days = !parsed.display_days;
        group_btn.click();
        current_metric = parsed.default_metric;
        chart_in.value = current_metric;
    }

    stored = localStorage.getItem("sessions");
    if (stored) {
        const parsed = JSON.parse(stored);
        sessions = parsed.map(s => new Session(s.date, s.type, s.velos));
        resetTable();
    }
}
function markUnsaved() {
    save_btn.className = "toggle red";
    unsaved = true;
}

const session_create_div = document.getElementById("session_create_div");
const session_date_in = document.getElementById("session_date_in");
const session_type_in = document.getElementById("session_type_in");

const velo_add_div = document.getElementById("velo_add_div");
const velo_div = document.getElementById("velo_div");

const sort_btns = document.querySelectorAll(".tbl_head_btn");
const session_select_in = document.getElementById("session_select_in");
const days_in = document.getElementById("days_in");
const days_btn = document.getElementById("days_btn");
const group_btn = document.getElementById("group_btn");

const chart_message = document.getElementById("chart_message");
const chart_in = document.getElementById("chart_in");

const autosave_btn = document.getElementById("autosave_btn");
const data_in = document.getElementById("data_in");
const data_reset_btn = document.getElementById("data_reset_btn");

const save_btn = document.getElementById("save_btn");
const alert_div = document.querySelector(".alert");

var sessions = [];
var days = [];
var displayed_data;
var chart_instance = null;
var unsaved = false;
var temp = localStorage.getItem("autosave");
var autosave = temp ? JSON.parse(temp) : false;

var current_date = "";
var current_type = "";
var current_velos = [];
var current_sort = {key: null, ascending: true};
var days_filter = false;
var display_days = true;
var current_metric = "Average";

window.addEventListener("load", loadSessionsFromLocal);
window.addEventListener("beforeunload", () => {
    saveSettingsToLocal();
    if (autosave) {saveSessionsToLocal();}
});
save_btn.addEventListener("click", saveSessionsToLocal);
document.getElementById("autosave_btn").addEventListener("click", () => {
    autosave = JSON.parse(localStorage.getItem("autosave"));
});
document.getElementById("alert_btn").addEventListener("click", () => {alert_div.style.display = "none";})

document.getElementById("session_submit_btn").addEventListener("click", confirmSession);
velo_add_btn.addEventListener("click", addVelo);
document.getElementById("velo_remove_btn").addEventListener("click", removeAllVelos);
document.getElementById("velo_submit_btn").addEventListener("click", () => {finishSession(0);});
document.getElementById("velo_cancel_btn").addEventListener("click", () => {finishSession(1);});

session_select_in.addEventListener("change", resetTable);
days_in.addEventListener("change", () => {
    if (days_in.value < 1) {days_in.value = 1;}
    if (days_filter) {resetTable();}
});
days_btn.addEventListener("click", () => {
    days_filter = !days_filter;
    days_btn.className = `toggle ${days_filter ? "on" : "off"}`;
    days_btn.textContent = days_filter ? "ON" : "OFF";
    resetTable();
});
group_btn.addEventListener("click", () => {
    display_days = !display_days;
    group_btn.className = `toggle ${display_days ? "on" : "off"}`;
    group_btn.textContent = display_days ? "ON" : "OFF";
    resetTable();
});
sort_btns.forEach(btn => {
    btn.addEventListener("click", () => {sortSessions(getCurrentData(), btn.name);});
});

chart_in.addEventListener("change", () => {
    current_metric = chart_in.value;
    drawChart(current_metric);
});

data_in.addEventListener("change", uploadSessions);
document.getElementById("data_btn").addEventListener("click", downloadSessions);
data_reset_btn.addEventListener("click", () => {
    data_in.value = "";
    data_reset_btn.style.display = "none";
});

console.log("velocity.js loaded");