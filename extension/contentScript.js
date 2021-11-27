const urlMatch = window.location.href.match(
  /adventofcode\.com\/(\d{4})(\/day\/(\d{1,2})(\/answer)?)?/
);

if (urlMatch && urlMatch[2]){
    const year = urlMatch[1];
    const day = urlMatch[3];

    let daySuccess = document.querySelector(".day-success");
    let progress = {
        page: urlMatch[4] ? "answer" : "challenge",
        progress: +(daySuccess != null)
    }

    if (!urlMatch[4] && daySuccess){
        progress["progress"] = daySuccess.innerHTML.split("*").length - 1;
    }

    chrome.runtime.sendMessage({
        command: "onChallengePage",
        year: year,
        day: day,
        progress: progress
    }, () => {});
}

if (window.location.href.match(/adventofcode\.com\/\d{4}\/settings/)){
    let userdata = {
        username: null,
        githubPage: null,
        profilePic: null
    };
    let settings = document.querySelector("#settings");
    let url = settings.querySelector("#display_url");
    if (url.checked){
        userdata.githubPage = url.parentElement.querySelector("span").innerHTML.match(/https:\/\/github.com\/.+/)[0];
    }
    
    settings.querySelectorAll("input[type=radio]").forEach((radio) => {
        if (radio.checked){
            let sp = radio.parentElement.querySelector("span");
            userdata.username = sp.innerText;

            let img = sp.querySelector("img");
            if (img){
                userdata.profilePic = img.src;
            }

        }
    });

    chrome.runtime.sendMessage({
        command: "updateUserdata",
        userdata: userdata
    }, () => {});
}