window.aocUU = new function () {

    // this.host = "https://aoc-uu.herokuapp.com";
    this.host = "http://localhost:3000";
    this.uuid = null;
    this.config = {
    };

    this.leaderBoardAction = function(data){
        if (!aocUU.uuid){
            console.error("No uuid set");
            return;
        }
        let url = `${aocUU.host}/api/${data.action}Leaderboard`;
        let xhr = new XMLHttpRequest();
        xhr.open("POST", url);
        data["userid"] = aocUU.uuid;
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify(data));
    }

    this.registerExt = function (cb) {
        let xhr = new XMLHttpRequest();
        xhr.open("GET", `${aocUU.host}/api/registerExt`);
        xhr.onload = function () {
            if (xhr.status == 200){
                cb(xhr.responseText);
                aocUU.uuid = xhr.responseText;
            } else {
                console.error(`Couldn't register extension`);
            }
        }
        xhr.send();
    }

    this.getLeaderboards = function (cb) {
        let xhr = new XMLHttpRequest();
        xhr.open("GET", `${aocUU.host}/api/leaderboards`);
        xhr.onload = function () {
            if (xhr.status == 200){
                cb(JSON.parse(xhr.responseText));
            } else {
                console.error(`Couldn't register extension`);
                cb([])
            }
        }
        xhr.send();
    }

    this.forceUpdateProgress = function (url) {
        let urlMatch = url.match(
            /adventofcode\.com\/(\d{4})(\/day\/(\d{1,2})(\/answer)?)?/
        );
        if (urlMatch[2]){
            const year = urlMatch[1];
            const day = urlMatch[3];
            if (year && day){
                aocUU.Challenges.postChallengeUpdate(year, day);
            }
        }        
    }

    this.setUsername = function (username, retry = true) {
        if (!this.uuid){
            console.error("No uuid registered.");
            if (retry)
                this.registerExt(this.setUsername(username), false);
            return;
        }
        let xhr = new XMLHttpRequest();
        xhr.open("POST", `${aocUU.host}/api/setUsername`);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify({
            username: username,
            userid: this.uuid
        }))
    }

    this.setConfig = function (config){
        chrome.storage.local.set({ config: config });
        if (this.config.userName != config.userName){
            this.setUsername(config.userName);
        }
        this.config = config;
    }

    this.loadConfig = function () {
        chrome.storage.local.get({ config: {} }, (res) => {
            if (res.config){
                aocUU.config = res.config;
            }
        });
    }

    this.loadConfig();
}
