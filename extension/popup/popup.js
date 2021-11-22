document.querySelector("#saveBtn").addEventListener("click", (ev) => {
    chrome.runtime.sendMessage({
        command: "setConfig",
        config: {
            userName: document.querySelector("#userName").value,
            leaderboardId: document.querySelector("#leaderboardId").value
        }
    }, () => {});
});

document.querySelector("#updateBtn").addEventListener("click", (ev) => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (tabs.length == 0 || !tabs[0].url)
            return;
        
        chrome.runtime.sendMessage({
            command: "forceUpdateProgress",
            url: tabs[0].url
        });
    });
});


chrome.runtime.sendMessage({
    command: "getConfig"
}, (res) =>{
    if (res.config){
        document.querySelector("#userName").value = res.config.userName;
        document.querySelector("#leaderboardId").value = res.config.leaderboardId;
    }
});
