aocUU.Challenges = new function () {

    this.challenges = {}

    this.onChallengePage = function (year, day, progress) {
        let c = {
            year: year,
            day: day,
            startTime: new Date(),
            starOne: null,
            starTwo: null
        }
        let postUpdate = false;
        if (this.challenges[year]){
            if (!this.challenges[year][day]){
                this.challenges[year][day] = c;
                postUpdate = true;
            }

        } else {
            this.challenges[year] = {};
            this.challenges[year][day] = c;
            postUpdate = true;
        }

        if (this.updateChallenge(year, day, progress) || postUpdate){
            this.postChallengeUpdate(year, day)
        }
        this.saveChallenges();
    }

    this.postChallengeUpdate = function(year, day){
        if (!aocUU.uuid){
            console.error("No userid set");
            alert("No userid set");
            return;
        }
        let c = this.challenges[year][day];
        let xhr = new XMLHttpRequest();
        xhr.open("POST", `${aocUU.host}/api/leaderboard/${c.year}/${c.day}`);
        xhr.setRequestHeader("Content-Type", "application/json");
        let obj = JSON.parse(JSON.stringify(c));
        obj["userid"] = aocUU.uuid;
        xhr.send(JSON.stringify(obj));
    }

    this.updateChallenge = function (year, day, progress){
        let c = this.challenges[year][day];
        let stars = progress.progress;
        if (c.starOne && !c.starTwo && (stars == 2 || (stars == 1 && progress.page == "answer"))){
            console.log(`Got star 2 for day ${day}-l${year} at: ${new Date()}`);
            this.challenges[year][day].starTwo = new Date();
            return true;    
        } else if (!c.starOne && stars == 1){
            console.log(`Got star 1 for day ${day}-l${year} at: ${new Date()}`);
            this.challenges[year][day].starOne = new Date();
            return true;
        } else if (!c.starOne && !c.starTwo && (stars == 2 || (stars == 1 && progress.page == "answer"))){
            // Both challenges are already finished before the extension was installed ¯\_(ツ)_/¯
            this.challenges[year][day].starOne = new Date();
            this.challenges[year][day].starTwo = new Date();
            return true;
        }
    }

    this.loadChallenges = function () {
        chrome.storage.local.get({"challenges": "{}"}, (result) => {
            this.challenges = JSON.parse(result["challenges"]);
        });
    }

    this.saveChallenges = function () {
        chrome.storage.local.set({"challenges":  JSON.stringify(this.challenges)});
    }

    this.loadChallenges();

}