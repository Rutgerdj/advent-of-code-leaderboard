document.querySelector("#saveBtn").addEventListener("click", (ev) => {
    chrome.runtime.sendMessage({
        command: "setConfig",
        config: {
            userName: document.querySelector("#userName").value
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
        }, () => {});
    });
});

document.querySelectorAll(".leaderboardBtn").forEach((btn) => {
    btn.addEventListener("click", (ev) => {
        chrome.runtime.sendMessage({
            command: "leaderboardAction",
            leaderboardId: document.querySelector("#leaderboardId").value,
            action: btn.getAttribute("data-action")
        }, () => {});
    }); 
})


chrome.runtime.sendMessage({
    command: "getConfig"
}, (res) =>{
    if (res.config){
        document.querySelector("#userName").value = res.config.userName;
    }
});
