const urlMatch = window.location.href.match(
  /adventofcode\.com\/(\d{4})(\/day\/(\d{1,2})(\/answer)?)?/
);

if (urlMatch[2]){
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
    });
}
