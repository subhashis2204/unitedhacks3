chrome.runtime.sendMessage({ todo: "showPageAction" });

window.addEventListener('load', (event) => { // run once window has finished loading
    renderTab();
    renderWindow();
    renderDim();
});

var initialTime = 60; // time in seconds
var currentTime = 0;

function renderTab() { // render tab for timer display
    var pixelFont = new FontFace('Pixeloid Sans', 'url("../assets/fonts/PixeloidSans.woff")', { style: 'normal', weight: 'normal' });
    document.fonts.add(pixelFont);

    let tabDiv = document.createElement("div");
    tabDiv.setAttribute("id", "crittersbreak-tab");
    document.body.appendChild(tabDiv);

    tabDiv.innerHTML = '<p id="crittersBreak-timeDisplay">5:00</p>'
    // style settings
    // body
    tabDiv.style.backgroundColor = "#ffffff";
    tabDiv.style.color = "#303030";
    tabDiv.style.fontFamily = "Pixeloid Sans";
    tabDiv.style.fontSize = "36px";
    tabDiv.style.position = "fixed";
    tabDiv.style.right = "0px";
    tabDiv.style.top = "200px";
    tabDiv.style.width = "120px";
    tabDiv.style.height = "60px";
    tabDiv.style.borderRadius = "5px 0 0 5px";
    tabDiv.style.display = "flex";
    tabDiv.style.justifyContent = "center";
    tabDiv.style.alignItems = "center";
    tabDiv.style.userSelect = "none";
    tabDiv.style.zIndex = 2147483646;

    document.getElementById("crittersBreak-timeDisplay").style.margin = "0";
}

function renderWindow() { // render window for sprite animation
    let windowDiv = document.createElement("div");
    windowDiv.setAttribute("id", "crittersbreak-window");
    document.body.appendChild(windowDiv);

    // windowDiv.innerHTML = '<p id="crittersBreak-timeDisplay">5:00</p>'
    // style settings
    // body
    windowDiv.style.backgroundColor = "#ffffff";
    windowDiv.style.color = "#303030";
    windowDiv.style.fontFamily = "Pixeloid Sans";
    windowDiv.style.fontSize = "36px";
    windowDiv.style.position = "fixed";
    windowDiv.style.right = "0px";
    windowDiv.style.top = "20px";
    windowDiv.style.width = "240px";
    windowDiv.style.height = "160px";
    windowDiv.style.borderRadius = "5px 0 0 5px";
    windowDiv.style.display = "flex";
    windowDiv.style.justifyContent = "center";
    windowDiv.style.alignItems = "center";
    windowDiv.style.zIndex = 2147483647;

    windowDiv.addEventListener("mouseover", dimScreen);
    windowDiv.addEventListener("mouseout", brightenScreen);
}

function renderDim() { // div for dimming screen
    let dimDiv = document.createElement("div");
    dimDiv.setAttribute("id", "crittersbreak-dim");
    document.body.appendChild(dimDiv);

    // style settings
    // body
    dimDiv.style.backgroundColor = "#303030";
    dimDiv.style.opacity = 0;
    dimDiv.style.position = "fixed";
    dimDiv.style.right = "0px";
    dimDiv.style.top = "0px";
    dimDiv.style.left = "0px";
    dimDiv.style.bottom = "0px";
    dimDiv.style.width = "100%";
    dimDiv.style.height = "100%";
    dimDiv.style.pointerEvents = "none";
    dimDiv.style.zIndex = 2147483645;
}

function dimScreen() {
    element = document.getElementById("crittersbreak-dim");
    element.style.display = 'block';
    var op = 0;  // initial opacity
    var timer = setInterval(function () {
        if (op >= 1){
            clearInterval(timer);
        }
        element.style.opacity = op;
        element.style.filter = 'alpha(opacity=' + op * 100 + ")";
        op += 0.05;
    }, 50);
}

function brightenScreen() {
    element = document.getElementById("crittersbreak-dim");
    var op = 1;  // initial opacity
    var timer = setInterval(function () {
        if (op <= 0.1){
            clearInterval(timer);
            element.style.display = 'none';
        }
        element.style.opacity = op;
        element.style.filter = 'alpha(opacity=' + op * 100 + ")";
        op -= 0.05;
    }, 50);
}

// To call defined fuction every second
let timer = setInterval(function () {
    if (currentTime == 0) currentTime = initialTime;
    let minutesNum = (currentTime - (currentTime % 60)) / 60;
    var minutesStr = "" + minutesNum;
    if (minutesNum == 0) minutesStr = "00"
    else if (minutesNum < 10) minutesStr = "0" + minutesStr;

    let secondsNum = currentTime - (minutesNum * 60);
    var secondsStr = "" + secondsNum;
    if (secondsNum == 0) secondsStr = "00"
    else if (secondsNum < 10) secondsStr = "0" + secondsStr;

    document.getElementById("crittersBreak-timeDisplay").innerHTML = minutesStr + ":" + secondsStr;

    if (currentTime > 0) currentTime--;
}, 1000);