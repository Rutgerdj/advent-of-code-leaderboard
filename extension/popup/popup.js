let leaderboards = [];
const lbSelect = document.querySelector("#leaderboardSelect");


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
        let selectedId = lbSelect.options[lbSelect.selectedIndex].value;
        if (selectedId){
            chrome.runtime.sendMessage({
                command: "leaderboardAction",
                leaderboardId: selectedId,
                action: btn.getAttribute("data-action"),
                name: document.querySelector("#leaderboardName").value
            }, () => {});
        }
    }); 
});


chrome.runtime.sendMessage({
    command: "getConfig"
}, (res) =>{
    if (res.config){
        document.querySelector("#userName").value = res.config.userName;
    }
});

chrome.runtime.sendMessage({
    command: "getLeaderboards"
}, (res) => {
    if (res.length > 0){
        res.forEach((lb) => {
            let opt = document.createElement("option");
            opt.value = lb.id;
            opt.innerHTML = lb.name
            document.querySelector("#leaderboardSelect").appendChild(opt);
        });
    }
});