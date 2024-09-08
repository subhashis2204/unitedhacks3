chrome.runtime.sendMessage({ todo: "showPageAction" });

chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        if (message.startContent == true) {
            renderTab();
            renderWindow();
            renderDim();
            loadTimer();
        }
    }
);

window.addEventListener('load', async (event) => { // run once window has finished loading
    if (chrome.runtime.id == undefined) return; // to prevent Uncaught Error: Extension context invalidated
    var result = await chrome.runtime.sendMessage({ getState: true });
    if (result != -1) { // there is already a timer running; load extension content instead of waiting for start timer
        renderTab();
        renderWindow();
        renderDim();
        loadTimer();
    }
});

const defaultBreakInterval = 0.1 * 60; //duration for working state
const defaultBreakDuration = 5 * 60;

var intervalTimer;

const rewardInterval = 10000; //10 seconds
var rewardTimer;

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
    tabDiv.style.backgroundColor = "#3B1F3F";
    tabDiv.style.color = "#fff";
    tabDiv.style.fontFamily = "Pixeloid Sans";
    tabDiv.style.fontSize = "20px";
    tabDiv.style.position = "fixed";
    tabDiv.style.right = "0px";
    tabDiv.style.top = "320px";
    tabDiv.style.width = "120px";
    tabDiv.style.height = "60px";
    tabDiv.style.borderRadius = "8px 0 0 8px";
    tabDiv.style.display = "flex";
    tabDiv.style.flexDirection = "column";
    tabDiv.style.justifyContent = "center";
    tabDiv.style.alignItems = "center";
    tabDiv.style.userSelect = "none";
    tabDiv.style.zIndex = 2147483646;
    tabDiv.style.cursor = "default";
    tabDiv.style.boxShadow = "rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px"
    tabDiv.style.padding = "8px";

    let tabText = document.createElement("p");
    tabText.setAttribute("id", "crittersbreak-tabText");
    tabDiv.appendChild(tabText);
    tabText.innerHTML = "Working...";
    tabText.style.margin = "0";
    tabText.style.fontSize = "14px";

    let tabIcon = document.createElement("div");
    tabIcon.setAttribute("id", "crittersbreak-tabIcon");
    tabDiv.appendChild(tabIcon);
    tabIcon.innerHTML = "<img src=\""+ chrome.runtime.getURL('assets/critters/sir-teddy/thumbnail.png') + "\">";
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
    windowDiv.style.background = "#3B1F3F";
    windowDiv.style.color = "#ffffff";
    windowDiv.style.opacity = 0;
    windowDiv.style.fontFamily = "Pixeloid Sans";
    windowDiv.style.fontSize = "36px";
    windowDiv.style.position = "fixed";
    windowDiv.style.right = "0px";
    windowDiv.style.top = "20px";
    windowDiv.style.width = "240px";
    windowDiv.style.height = "240px";
    windowDiv.style.padding = "10px";
    windowDiv.style.boxSizing = "border-box"
    windowDiv.style.borderRadius = "5px 0 0 5px";
    windowDiv.style.display = "none";
    windowDiv.style.flexDirection = "column"
    windowDiv.style.justifyContent = "space-between";
    windowDiv.style.alignItems = "center";
    windowDiv.style.boxShadow = "rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px"
    windowDiv.style.zIndex = 2147483647;

    let closeButton = document.createElement("div");
    windowDiv.appendChild(closeButton);
    closeButton.innerHTML = `<p>x</p>`
    closeButton.getElementsByTagName("p")[0].style.margin = "0";
    closeButton.style.display = "flex";
    closeButton.style.justifyContent = "center";
    closeButton.style.alignItems = "center";
    closeButton.style.background = "#7d4d83";
    closeButton.style.width = "32px";
    closeButton.style.height = "32px";
    closeButton.style.cursor = "pointer"
    closeButton.style.borderRadius = "100%";
    closeButton.style.border = "solid 2px #fff"
    closeButton.style.position = "absolute";
    closeButton.style.top = "-12px";
    closeButton.style.left = "-12px";
    closeButton.style.fontSize = "14px";
    closeButton.addEventListener("click", hideWindow);

    let critterBox = document.createElement("div");
    critterBox.style.background = "#7d4d83"
    critterBox.style.width = "100%";
    critterBox.style.height = "140px";
    critterBox.style.borderRadius = "4px";
    critterBox.style.position = "relative";
    critterBox.style.display = "flex";
    critterBox.style.justifyContent = "center";
    critterBox.style.alignItems = "center";
    critterBox.style.cursor = "none";
    critterBox.setAttribute("id", "crittersbreak-critterBox")
    windowDiv.appendChild(critterBox);

    let scoreDiv = document.createElement("div");
    scoreDiv.style.background = "#3B1F3F";
    scoreDiv.style.display = "flex";
    scoreDiv.style.justifyContent = "center";
    scoreDiv.style.alignItems = "center";
    scoreDiv.style.position = "absolute"
    scoreDiv.style.right = "12px";
    scoreDiv.style.top = "12px";
    scoreDiv.style.padding = " 2px 8px"
    scoreDiv.style.width = "60px";
    scoreDiv.style.borderRadius = "4px";
    critterBox.appendChild(scoreDiv);

    let scoreText =  document.createElement("p");
    scoreText.innerHTML = "+0";
    scoreText.style.fontSize = "14px"
    scoreText.style.margin = "0";
    scoreText.setAttribute("id", "crittersbreak-scoreText")
    scoreDiv.appendChild(scoreText);
    
    let coinIcon = document.createElement("img");
    coinIcon.src = chrome.runtime.getURL('assets/coin.png');
    coinIcon.style.height = "16px"
    coinIcon.style.width = "16px"
    scoreDiv.appendChild(coinIcon);
    
    let windowInstructions = document.createElement("p");
    windowInstructions.innerHTML = "Take a break! Place your cursor in the box above. \n (You may remove your cursor anytime)"
    windowInstructions.setAttribute("id", "crittersbreak-windowInstructions");
    windowInstructions.style.textAlign = "center";
    windowInstructions.style.fontSize = "12px";
    windowDiv.appendChild(windowInstructions);



    let critterSprite = document.createElement("img");
    critterSprite.src = chrome.runtime.getURL('assets/critters/sir-teddy/idle.gif');
    critterSprite.style.height = "60%";
    critterSprite.style.transform = "translateY(20px)";
    critterSprite.setAttribute("id", "crittersbreak-critterSprite")
    critterBox.appendChild(critterSprite);

    critterBox.addEventListener("mouseover", function () {
        mouseOnCritter();
    })

    critterBox.addEventListener("mouseout", function () {
        mouseOffCritter();
    })


}

function mouseOnCritter() {
    let sprite = document.getElementById("crittersbreak-critterSprite");
    sprite.src = chrome.runtime.getURL('assets/critters/sir-teddy/playing.gif');
    rewardTimer = setInterval(() => {
        chrome.storage.sync.get("coins").then((result) => {
            if (result.coins === undefined) {
                chrome.storage.sync.set({coins: 2});
            } else {
                chrome.storage.sync.set({coins: result.coins + 2});
            }

            chrome.storage.sync.get("coinsEarned").then((result) => {
                if (result.coinsEarned === undefined) {
                    chrome.storage.sync.set({coinsEarned: 2});
                    document.getElementById("crittersbreak-scoreText").innerHTML = "+2";
                } else {
                    chrome.storage.sync.set({coinsEarned: result.coinsEarned + 2});
                    document.getElementById("crittersbreak-scoreText").innerHTML = `+${result.coinsEarned + 2}`;

                }
            })
        })
    }, rewardInterval);
}

function mouseOffCritter() {
    let sprite = document.getElementById("crittersbreak-critterSprite");
    sprite.src = chrome.runtime.getURL('assets/critters/sir-teddy/idle.gif');
    clearInterval(rewardTimer);
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
            if (op >= 0.95){
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
    var result = await chrome.runtime.sendMessage({ getState: true });
    if (result == -1) {
        // start service worker timer + use defaults
        chrome.runtime.sendMessage({ startTimer: true, timerState: 0, timerTime: await stateToTime(0) });
    } else {
        // update DOM to reflect current state
        if (result == 0) {
            toWork();
        } else {
            toBreak();
        }
    }
    startTimer();
}

async function startTimer() {
    let timer = setInterval(async function () {
        if (chrome.runtime.id == undefined) return; // to prevent Uncaught Error: Extension context invalidated
        time = await chrome.runtime.sendMessage({ getTime: true });

        if (time >= 0) {
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
        } else { // timer goes to zero
            var state = await chrome.runtime.sendMessage({ getState: true });
            if (state == 0) { // transition to break
                toBreak();
                chrome.runtime.sendMessage({ startTimer: true, timerState: 1, timerTime: await stateToTime(1) });
            } else { // transition to work
                toWork();
                chrome.runtime.sendMessage({ startTimer: true, timerState: 0, timerTime: await stateToTime(0) });
            }

            clearInterval(timer);
            startTimer();
        }
    }, 100); // more frequent refresh rate in case of lag
}

function toBreak() { // switch to "break" mode
    document.getElementById("crittersbreak-tab").style.cursor = "pointer";
    document.getElementById("crittersbreak-tabText").innerHTML = "Take a break!";
    document.getElementById("crittersbreak-tabIcon").style.display = "block";
    document.getElementById("crittersbreak-tab").addEventListener("click", toggleWindow);

    document.getElementById("crittersbreak-critterBox").addEventListener("mouseover", dimScreen);
    document.getElementById("crittersbreak-critterBox").addEventListener("mouseout", brightenScreen);
}

function toWork() { // switch to "work" mode
    document.getElementById("crittersbreak-tab").style.cursor = "default";
    document.getElementById("crittersbreak-tabText").innerHTML = "Working...";
    document.getElementById("crittersbreak-tabIcon").style.display = "none";
    document.getElementById("crittersbreak-tab").removeEventListener("click", toggleWindow);

    document.getElementById("crittersbreak-window").removeEventListener("mouseover", dimScreen);
    document.getElementById("crittersbreak-window").removeEventListener("mouseout", brightenScreen);

    brightenScreen();
    hideWindow();
}

async function stateToTime(state) { // retrieves the duration for the given state, based on user settings
    var result = await getChromeSettings();
    if (state == 0) { // work: get break interval from user settings or use default
        return (result.settings != undefined) ? parseInt(result.settings.breakInterval * 60) : defaultBreakInterval;
    } else { // break: get break duration from user settings or get default
        return (result.settings != undefined) ? parseInt(result.settings.breakDuration * 60) : defaultBreakDuration;
    }
}

const getChromeSettings = () => // Get user setings from Chrome storage
    new Promise(function (resolve) {
        chrome.storage.sync.get("settings", function (result) {
            resolve(result);
        });
    });