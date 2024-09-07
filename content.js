chrome.runtime.sendMessage({ todo: "showPageAction" });

window.addEventListener('load', (event) => { // run once window has finished loading
    if (chrome.runtime.id == undefined) return; // to prevent Uncaught Error: Extension context invalidated
    renderTab();
    renderWindow();
    renderDim();
    loadTimer();
});

const defaultBreakInterval = 25 * 60;
const defaultBreakDuration = 5 * 60;

var currentState; // 0: work, 1: break
var currentTime = -1; // in seconds
var intervalTimer;

async function renderTab() { // render tab for timer display
    var pixelFont = document.createElement('style');
    pixelFont.textContent = '@font-face { font-family: Pixeloid Sans;'
                            + 'src: url("' + chrome.runtime.getURL('assets/fonts/PixeloidSans.woff') + '"); }';
    document.head.appendChild(pixelFont);

    let tabDiv = document.createElement("div");
    tabDiv.setAttribute("id", "crittersbreak-tab");
    document.body.appendChild(tabDiv);

    tabDiv.innerHTML = '<p id="crittersBreak-timeDisplay"></p>'
    // style settings
    // body
    tabDiv.style.backgroundColor = "#7d4d83";
    tabDiv.style.color = "#fff";
    tabDiv.style.fontFamily = "Pixeloid Sans";
    tabDiv.style.fontSize = "20px";
    tabDiv.style.position = "fixed";
    tabDiv.style.right = "0px";
    tabDiv.style.top = "200px";
    tabDiv.style.width = "120px";
    tabDiv.style.height = "60px";
    tabDiv.style.borderRadius = "5px 0 0 5px";
    tabDiv.style.display = "flex";
    tabDiv.style.flexDirection = "column";
    tabDiv.style.justifyContent = "center";
    tabDiv.style.alignItems = "center";
    tabDiv.style.userSelect = "none";
    tabDiv.style.zIndex = 2147483646;
    tabDiv.style.cursor = "default";

    let tabText = document.createElement("p");
    tabText.setAttribute("id", "crittersbreak-tabText");
    tabDiv.appendChild(tabText);
    tabText.innerHTML = "Working...";
    tabText.style.margin = "0";
    tabText.style.fontSize = "14px";

    let tabIcon = document.createElement("div");
    tabIcon.setAttribute("id", "crittersbreak-tabIcon");
    tabDiv.appendChild(tabIcon);
    tabIcon.innerHTML = "<img src=\""+ chrome.runtime.getURL('assets/critters/sir-teddy/idle/idle-1.png') + "\">";
    tabIcon.getElementsByTagName("img")[0].style.height = "30px";
    tabIcon.style.backgroundColor = "#3B1F3F"
    tabIcon.style.width = "32px";
    tabIcon.style.height = "32px";
    tabIcon.style.borderRadius = "100%";
    tabIcon.style.border = "solid 2px #fff"
    tabIcon.style.position = "absolute";
    tabIcon.style.top = "-12px";
    tabIcon.style.left = "-12px";
    tabIcon.style.display = "none";

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
    if (result.settings == undefined || result?.settings?.dimming == true) {
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
        op -= 0.1;
    }, 50);
}

function toggleWindow() {
    var elWindow = document.getElementById("crittersbreak-window");
    if (elWindow.style.display == 'none') revealWindow();
    else hideWindow();
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
    var result = await getChromeCurrData();
    if (result?.currentData?.timeLeft != null && result?.currentData?.timeLeft != undefined && result?.currentData?.timeLeft != NaN) { // if saved data from another page exists
        currentState = result.currentData.state;
        currentTime = result.currentData.timeLeft;
    } else { // use defaults
        currentState = 0;
        currentTime = await stateToTime(currentState); // i.e. default break interval
    }
    startTimer(currentState, currentTime);
}

async function startTimer(state, time) {
    const currentData = {};
    currentData.state = state;
    let timer = setInterval(async function () {
        if (chrome.runtime.id == undefined) return; // to prevent Uncaught Error: Extension context invalidated
        currentData.timeLeft = time;
        chrome.storage.session.set({currentData});

        // Calculate minutes
        let minutesNum = (time - (time % 60)) / 60;
        var minutesStr = "" + minutesNum;
        if (minutesNum == 0) minutesStr = "00"
        else if (minutesNum < 10) minutesStr = "0" + minutesStr;
    
        // Calculate seconds
        let secondsNum = time - (minutesNum * 60);
        var secondsStr = "" + secondsNum;
        if (secondsNum == 0) secondsStr = "00"
        else if (secondsNum < 10) secondsStr = "0" + secondsStr;
    
        // Update display with time
        if (document.getElementById("crittersBreak-timeDisplay") != null) document.getElementById("crittersBreak-timeDisplay").innerHTML = minutesStr + ":" + secondsStr;
    
        if (time > 0) time--;
        else { // timer goes to zero
            if (state == 0) { // transition to break
                state = 1;
                document.getElementById("crittersbreak-tab").style.cursor = "pointer";
                document.getElementById("crittersbreak-tabText").innerHTML = "Take a break!";
                document.getElementById("crittersbreak-tabIcon").style.display = "block";
                document.getElementById("crittersbreak-tab").addEventListener("click", toggleWindow);

                document.getElementById("crittersbreak-window").addEventListener("mouseover", dimScreen);
                document.getElementById("crittersbreak-window").addEventListener("mouseout", brightenScreen);
            } else { // transition to work
                state = 0;
                document.getElementById("crittersbreak-tab").style.cursor = "default";
                document.getElementById("crittersbreak-tabText").innerHTML = "Working...";
                document.getElementById("crittersbreak-tabIcon").style.display = "none";
                document.getElementById("crittersbreak-tab").removeEventListener("click", toggleWindow);

                document.getElementById("crittersbreak-window").removeEventListener("mouseover", dimScreen);
                document.getElementById("crittersbreak-window").removeEventListener("mouseout", brightenScreen);

                brightenScreen();
                hideWindow();
            }

            clearInterval(timer);
            startTimer(state, await stateToTime(state));
        }
    }, 1000);
}

async function stateToTime(state) { // retrieves the duration for the given state, based on user settings
    var result = await getChromeSettings();
    if (state == 0) { // work: get break interval from user settings or use default
        return (result.settings != undefined) ? parseInt(result.settings.breakInterval * 60) : defaultBreakInterval;
    } else { // break: get break duration from user settings or get default
        return (result.settings != undefined) ? parseInt(result.settings.breakDuration * 60) : defaultBreakDuration;
    }
}

const getChromeCurrData = () => // Get the saved state and timing (from other pages) from Chrome storage
    new Promise(function (resolve) {
        chrome.storage.session.get("currentData", function (result) {
            resolve(result);
        });
    });

const getChromeSettings = () => // Get user setings from Chrome storage
    new Promise(function (resolve) {
        chrome.storage.sync.get("settings", function (result) {
            resolve(result);
        });
    });