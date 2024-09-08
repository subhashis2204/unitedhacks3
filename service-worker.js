chrome.storage.session.setAccessLevel({ accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS' });

var time = -1;
var state = -1;
var timer;

chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        if (message.startTimer == true) {
            clearInterval(timer); // clear any existing timer in case it persisted
            time = message.timerTime;
            state = message.timerState;
            timer = setInterval(async function () {
                time--;
                if (time < 0) clearInterval(timer);
            }, 1000);
        }

        if (message.getTime == true) {
            sendResponse(time);
        }

        if (message.getState == true) {
            sendResponse(state);
        }
    }
);