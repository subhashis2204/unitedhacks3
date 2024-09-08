# Solution Implementation
## List of Key Features
1. **"Work" and "break" timers**: Once the user starts the addon, our addon will continuously cycle between "work" and "break" timers with appropriate captions to inform the user whenever it is time to take a break.
2. **Critter animations**: During the "break" timer, the user can click on a tab to "summon" a critter, who will appear to interact with the user's cursor when the user hovers their cursor over a window and keeps it there. This is also how we keep track if the user is taking a break.
3. **Screen dimming**: When the user hovers their cursor over the break window, the screen will automatically darken. This, in addition to their inability to move their cursor to do work without stopping the critter animation, will incentivise users to move away from their screens entirely and take a proper break.
4. **Point system + selectable critters**: Users can accumulate points based on how many minutes they spend taking breaks; these points can then be used to unlock new critters as a "reward" to give users extrinsic motivation to take breaks.
5. **User settings**: Users can manually adjust the break duration, break interval and whether or not to enable screen dimming. These settings will persist on the user's account even if they were to switch devices.
## Other Technical Details
- To render content (i.e. the timer tab and window for the user to hover their cursor over) on the webpages, we use a content script to inject HTML into the page.
- To allow for persistence across different tabs, we make use of a background service worker to store the timer values (i.e. the "work" / "break" state, as well as the time remaining). Our content script then sends a message to the service worker at fixed intervals to update its current state and time.
- To save user settings across different devices on the same account, we store the settings using the chrome.storage API.
## Other Implementation Details
Our team coded this addon using Visual Studio Code, and used GitHub for version control and collaboration. We also decided to test it on Google Chrome due to its larger share in the browser market.
