chrome.runtime.sendMessage({ todo: "showPageAction" });

window.addEventListener('load', (event) => { // run once window has finished loading
    renderTab();
    renderWindow();
    renderDim();
    loadTimer();
});

var currentTime = -2; // in seconds; -1 means new timer, -2 means new page load
var intervalTimer;

var savedState = -1; // 0: work, 1: break
var cachedTime = -1;

function renderTab() { // render tab for timer display
    var pixelFont = new FontFace('Pixeloid Sans', 'url("../assets/fonts/PixeloidSans.woff")', { style: 'normal', weight: 'normal' });
    document.fonts.add(pixelFont);

    let tabDiv = document.createElement("div");
    tabDiv.setAttribute("id", "crittersbreak-tab");
    document.body.appendChild(tabDiv);

    tabDiv.innerHTML = '<p id="crittersBreak-timeDisplay"></p>'
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
    tabDiv.style.cursor = "default";

    document.getElementById("crittersBreak-timeDisplay").style.margin = "0";
}

function renderWindow() { // render window for sprite animation
    let windowDiv = document.createElement("div");
    windowDiv.setAttribute("id", "crittersbreak-window");
    document.body.appendChild(windowDiv);

    windowDiv.innerHTML = '<img id="crittersBreak-animation"></img>'
    // style settings
    // body
    windowDiv.style.backgroundColor = "#ffffff";
    windowDiv.style.color = "#303030";
    windowDiv.style.opacity = 0;
    windowDiv.style.fontFamily = "Pixeloid Sans";
    windowDiv.style.fontSize = "36px";
    windowDiv.style.position = "fixed";
    windowDiv.style.right = "0px";
    windowDiv.style.top = "20px";
    windowDiv.style.width = "240px";
    windowDiv.style.height = "160px";
    windowDiv.style.borderRadius = "5px 0 0 5px";
    windowDiv.style.display = "none";
    windowDiv.style.justifyContent = "center";
    windowDiv.style.alignItems = "center";
    windowDiv.style.zIndex = 2147483647;
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

async function dimScreen() {
    clearInterval(intervalTimer);
    const result = await getChromeSettings();
    if (result?.settings?.dimming == true) {
        var elDim = document.getElementById("crittersbreak-dim");
        elDim.style.display = 'block';
        var op = parseFloat(elDim.style.opacity);  // initial opacity
        intervalTimer = setInterval(function () {
            if (op >= 1){
                clearInterval(intervalTimer);
            }
            elDim.style.opacity = op;
            elDim.style.filter = 'alpha(opacity=' + op * 100 + ")";
            op += 0.05;
        }, 50);
    }
}

function brightenScreen() {
    clearInterval(intervalTimer);
    var elDim = document.getElementById("crittersbreak-dim");
    var op = parseFloat(elDim.style.opacity);  // initial opacity
    intervalTimer = setInterval(function () {
        if (op <= 0.1){
            clearInterval(intervalTimer);
            elDim.style.display = 'none';
        }
        elDim.style.opacity = op;
        elDim.style.filter = 'alpha(opacity=' + op * 100 + ")";
        op -= 0.05;
    }, 50);
}

function revealWindow() {
    var elWindow = document.getElementById("crittersbreak-window");
    if (elWindow.style.opacity < 0.1) {
        elWindow.style.display = 'flex';
        var op = parseFloat(elWindow.style.opacity);  // initial opacity
        var timer = setInterval(function () {
            if (op >= 1){
                clearInterval(timer);
            }
            elWindow.style.opacity = op;
            elWindow.style.filter = 'alpha(opacity=' + op * 100 + ")";
            op += 0.1;
        }, 50);
    }
}

function hideWindow() {
    var elWindow = document.getElementById("crittersbreak-window");
    if (elWindow.style.opacity > 0.9) {
        var op = parseFloat(elWindow.style.opacity);  // initial opacity
        var timer = setInterval(function () {
            if (op <= 0.1){
                clearInterval(timer);
                elWindow.style.display = 'none';
            }
            elWindow.style.opacity = op;
            elWindow.style.filter = 'alpha(opacity=' + op * 100 + ")";
            op -= 0.1;
        }, 50);
    }
}

async function loadTimer() {
    const result = await getChromeCurrData();
    if (result?.currentData?.timeLeft != null && result?.currentData?.timeLeft != undefined) {
        savedState = result.currentData.state;
        cachedTime = result.currentData.timeLeft;
    } else {
        savedState = 0;
        cachedTime = await stateToTime(savedState);
    }
    startTimer();
}

async function startTimer() {
    var initialTime = (currentTime == -2) ? cachedTime : await stateToTime(savedState);
    const currentData = {};
    currentData.state = savedState;
    let timer = setInterval(function () {
        if (currentTime <= -1) currentTime = initialTime;

        currentData.timeLeft = currentTime;
        chrome.storage.session.set({currentData});

        let minutesNum = (currentTime - (currentTime % 60)) / 60;
        var minutesStr = "" + minutesNum;
        if (minutesNum == 0) minutesStr = "00"
        else if (minutesNum < 10) minutesStr = "0" + minutesStr;
    
        let secondsNum = currentTime - (minutesNum * 60);
        var secondsStr = "" + secondsNum;
        if (secondsNum == 0) secondsStr = "00"
        else if (secondsNum < 10) secondsStr = "0" + secondsStr;
    
        if (document.getElementById("crittersBreak-timeDisplay") != null) document.getElementById("crittersBreak-timeDisplay").innerHTML = minutesStr + ":" + secondsStr;
    
        if (currentTime > 0) currentTime--;
        else { // timer goes to zero
            if (savedState == 0) { // transition to break
                savedState = 1;
                document.getElementById("crittersbreak-tab").style.cursor = "pointer";
                document.getElementById("crittersBreak-timeDisplay").innerHTML = "Break";
                document.getElementById("crittersbreak-tab").addEventListener("click", revealWindow);

                document.getElementById("crittersbreak-window").addEventListener("mouseover", dimScreen);
                document.getElementById("crittersbreak-window").addEventListener("mouseout", brightenScreen);
                startTimer();
            } else { // transition to work
                savedState = 0;
                document.getElementById("crittersbreak-tab").style.cursor = "default";
                document.getElementById("crittersBreak-timeDisplay").innerHTML = "Work";
                document.getElementById("crittersbreak-tab").removeEventListener("click", revealWindow);

                document.getElementById("crittersbreak-window").removeEventListener("mouseover", dimScreen);
                document.getElementById("crittersbreak-window").removeEventListener("mouseout", brightenScreen);

                brightenScreen();
                hideWindow();
                startTimer();
            }
            
            currentTime = -1;
            clearInterval(timer);
        }
    }, 1000);
}

async function stateToTime(state) {
    var result = await getChromeSettings();
    if (state == 0) { // break interval
        return parseInt(result?.settings?.breakInterval * 60) ?? (5);
    } else { // break duration
        return parseInt(result?.settings?.breakDuration * 60) ?? (3);
    }
}

const getChromeCurrData = () =>
    new Promise(function (resolve) {
        chrome.storage.session.get("currentData", function (result) {
            resolve(result);
        });
    });

const getChromeSettings = () =>
    new Promise(function (resolve) {
        chrome.storage.sync.get("settings", function (result) {
            resolve(result);
        });
    });