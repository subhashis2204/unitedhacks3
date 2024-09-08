const settings = {}; // in-page cache of setting changes

const defaultCritters = [
    {
        name: "Sir Teddy",
        folder: "sir-teddy",
        cost: 0,
        status: "unlocked"
    },
    {
        name: "Hachiko",
        folder: "hachiko",
        cost: 500,
        status: "locked"
    }
]

var critterList = defaultCritters
var activeCritter = 0


window.addEventListener("load", async event => {
    revertSettings();
    initCritterList();
    retrieveCoins();
    document.getElementById("my-critters-btn").addEventListener("click", function () {
        openTab("my-critters")
    });
    document.getElementById("settings-btn").addEventListener("click", function () {
        openTab("settings")
    });

    document.querySelector('input[type=submit]').addEventListener("click", saveSettings);
    document.querySelector('input[type=reset]').addEventListener("click", revertSettings);

    // async stuff below; anything
    state = await chrome.runtime.sendMessage({ getState: true });
    if (state != -1) { // already a timer running; cannot start timer
        document.querySelector('input[type=button]').classList.add("disabled");
        document.getElementById("startButton").value = "Session has started"
    } else {
        document.querySelector('input[type=button]').addEventListener("click", function () {
            if (document.getElementById("startButton").classList.contains("buy")) {
                document.getElementById("startButton").classList.remove("buy");
                buyCritter();
            } else if (!document.getElementById("startButton").classList.contains("no-buy")) {
                startContent();
            }

        });

    }
})

chrome.runtime.onMessage.addListener(
    function (message, sender, sendResponse) {
        if (message.endContent == true) {
            endContent();
        }
    }
)

function buyCritter() {
    var critterIndex;
    chrome.storage.sync.get("activeCritter").then((result) => {
        critterIndex = result.activeCritter;
        document.getElementById(`thumbnail-${critterIndex}`).classList.remove("locked");
        document.getElementById(critterList[critterIndex].folder).classList.remove("locked");
        chrome.storage.sync.get("critters").then((res) => {
            var crittersArr = res.critters;
            crittersArr[critterIndex].status = "unlocked"
            chrome.storage.sync.set({ critters: crittersArr })
            critterList = crittersArr;
            chrome.storage.sync.get("coins").then((coinRes) => {
                chrome.storage.sync.set({ coins: coinRes.coins - crittersArr[critterIndex].cost });
                document.getElementById("coinText").innerHTML = `Coins: ${coinRes.coins - crittersArr[critterIndex].cost}`;
            })

        })
    })
    document.getElementById("critter-preview").classList.remove("locked");
    document.getElementById("focus-box").classList.remove("locked");
    document.getElementById("startButton").value = "Start Session!";
    document.getElementById("priceTag").innerHTML = "Unlocked";
}

function openTab(tabName) {
    if (document.getElementsByClassName("open")[0].id != tabName) {
        document.getElementsByClassName("open")[0].classList.toggle("open");
        document.getElementById(tabName).classList.toggle("open");
        document.getElementsByClassName("selectedTab")[0].classList.toggle("selectedTab");
        document.getElementById(`${tabName}-btn`).classList.toggle("selectedTab");
    }
}

function revertSettings() {
    chrome.storage.sync.get("settings", function (result) {
        // If result is null, use default values
        try {
            document.getElementById("interval").value = result.settings.breakInterval;
        } catch (error) {
            document.getElementById("interval").value = 25;
        }

        try {
            document.getElementById("duration").value = result.settings.breakDuration;
        } catch (error) {
            document.getElementById("duration").value = 5;
        }

        try {
            document.getElementById("cycles").value = result.settings.cyclesNum;
        } catch (error) {
            document.getElementById("cycles").value = 5;
        }

        try {
            document.getElementById("dimming").checked = result.settings.dimming;
        } catch (error) {
            document.getElementById("dimming").checked = true;
        }
    });
}

function saveSettings() {
    settings.breakInterval = document.getElementById("interval").value;
    settings.breakDuration = document.getElementById("duration").value;
    settings.cyclesNum = document.getElementById("cycles").value;
    settings.dimming = document.getElementById("dimming").checked;
    chrome.storage.sync.set({ settings });
}

function startContent() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { startContent: true });
    });
    document.querySelector('input[type=button]').removeEventListener("click", startContent);
    document.querySelector('input[type=button]').classList.add("disabled");
    document.getElementById("startButton").value = "Session has started"

    chrome.storage.sync.set({ coinsEarned: 0 });
    chrome.storage.sync.set({ currCycle: 0 })
    
}

function endContent() {
    document.querySelector('input[type=button]').addEventListener("click", startContent);
    document.querySelector('input[type=button]').classList.remove("disabled");
    document.getElementById("startButton").value = "Start Session"

    
}

const retrieveCoins = () => {
    chrome.storage.sync.get("coins").then((result) => {

        if (result.coins === undefined) {
            document.getElementById("coinText").innerHTML = `Coins: 0`
            chrome.storage.sync.set({ coins: 0 })
        } else {
            document.getElementById("coinText").innerHTML = `Coins: ${result.coins}`
        }
    })
}

const updateActiveCritter = (newCritter) => {
    document.getElementsByClassName("active")[0].classList.toggle("active");
    document.getElementById(defaultCritters[newCritter].folder).classList.toggle("active");
    document.getElementById("critter-preview").src = `../assets/critters/${defaultCritters[newCritter].folder}/thumbnail.png`
    document.getElementById("focus-critter-name").innerHTML = defaultCritters[newCritter].name
    if (critterList[newCritter].status === "locked") {
        document.getElementById("priceTag").innerHTML = `Cost: ${critterList[newCritter].cost}` + `<img src="../assets/coin.png" alt="coin" id="coinIcon" />`
        document.getElementById("startButton").value = "Buy Critter";
        document.getElementById("critter-preview").classList.add("locked");
        document.getElementById("focus-box").classList.add("locked");
        chrome.storage.sync.get("coins").then((result) => {
            if (result.coins >= critterList[newCritter].cost) {
                document.getElementById("startButton").classList.add("buy");
            } else {
                document.getElementById("startButton").classList.add("no-buy");
            }
        })



    } else {
        document.getElementById("priceTag").innerHTML = "Unlocked"
        document.getElementById("startButton").value = "Start Session!";
        document.getElementById("startButton").classList.remove("buy");
        document.getElementById("startButton").classList.remove("no-buy");
        document.getElementById("critter-preview").classList.remove("locked");
        document.getElementById("focus-box").classList.remove("locked");

    }


    chrome.storage.sync.set({ activeCritter: newCritter })
}


//initialise critter list and active critter for display on popup (either from storage or default list)
const initCritterList = () => {

    chrome.storage.sync.get("critters").then((result) => {
        console.log(result)
        if (!result.critters) {
            console.log("No critters in storage")
            chrome.storage.sync.set({ critters: defaultCritters })
        } else {
            critterList = result.critters
        }
        chrome.storage.sync.get("activeCritter").then((result) => {
            console.log(result)
            if (result.activeCritter === undefined) {
                chrome.storage.sync.set({ critters: defaultCritters })
                console.log("No active critter in storage")
                chrome.storage.sync.set({ activeCritter: 0 })
            } else {
                activeCritter = result.activeCritter
            }

            document.getElementById("focus-critter-name").innerHTML = critterList[activeCritter].name
            document.getElementById("critter-preview").src = `../assets/critters/${critterList[activeCritter].folder}/thumbnail.png`

            if (critterList[activeCritter].status === "locked") {
                document.getElementById("critter-preview").classList.add("locked");
                document.getElementById("focus-box").classList.add("locked");
                document.getElementById("priceTag").innerHTML = `Cost: ${critterList[activeCritter].cost}` + `<img src="../assets/coin.png" alt="coin" id="coinIcon" />`
                document.getElementById("startButton").value = "Buy Critter";
                chrome.storage.sync.get("coins").then((result) => {
                    if (result.coins >= critterList[activeCritter].cost) {
                        document.getElementById("startButton").classList.add("buy");
                    } else {
                        document.getElementById("startButton").classList.add("no-buy");
                    }
                })
            } else {
                document.getElementById("priceTag").innerHTML = "Unlocked";
                document.getElementById("critter-preview").classList.remove("locked");
                document.getElementById("focus-box").classList.remove("locked");
                document.getElementById("startButton").classList.remove("no-buy");
                document.getElementById("startButton").classList.remove("buy");
                document.getElementById("startButton").value = "Start Session!";

            }


            if (critterList) {
                for (var i = 0; i < critterList.length; i++) {
                    const thumbnail = document.createElement("img");
                    thumbnail.src = `../assets/critters/${critterList[i].folder}/thumbnail.png`
                    thumbnail.setAttribute("class", ((critterList[i].status === "locked") ? "locked" : ""))
                    thumbnail.setAttribute("id", `thumbnail-${i}`)
                    const btn = document.createElement("button");
                    btn.setAttribute("id", critterList[i].folder);
                    if (i === activeCritter) {
                        btn.classList.add("active");
                    }
                    if (critterList[i].status === "locked") {
                        btn.classList.add("locked");
                    }
                    btn.addEventListener("click", function (index) {
                        return function () {
                            updateActiveCritter(index);
                        }
                    }(i));
                    btn.appendChild(thumbnail);
                    const listItem = document.createElement("li");
                    listItem.appendChild(btn);
                    document.getElementById("critters-list").appendChild(listItem);
                }
            }
        })
    })


}


