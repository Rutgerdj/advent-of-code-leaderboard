var express = require("express");
var router = express.Router();
var sql = require("mssql");

var config = {
  user: process.env.DBUSER,
  password: process.env.DBPASSWORD,
  server: process.env.DBSERVER,
  database: process.env.DBNAME,
};


router.get("/:leaderboardId/:year?/:day?", function (req, res, next) {
  console.log(req.params);

  sql.connect(config, function (err) {
    if (err){
      console.log(err);
      res.sendStatus(500);
      return;
    }  
    var request = new sql.Request();
    request.input("leaderboardId", req.params.leaderboardId.slice(0, 36));
    request.input("year", req.params.year);
    request.input("day", req.params.day);
    request.query(
      `
      SELECT name, ISNULL((
              SELECT users.userid, users.username, year, day, startTime, starOne, starTwo
          FROM challenges
              INNER JOIN user_leaderboards ul ON ul.userid = challenges.userid
              INNER JOIN users ON users.userid = ul.userid
          WHERE 
                  ul.leaderboardId = leaderboard.id
              AND
              (year = @year OR @year IS NULL)
              AND
              (day  = @day  OR @day  IS NULL)

          FOR JSON PATH, INCLUDE_NULL_VALUES), '[]') AS challenges
      FROM leaderboard
      WHERE id = @leaderboardId
    `,
      function (err, recordset) {
        if (err){
          console.log(err);
          res.sendStatus(500);
          return;
        }
        let result = recordset.recordset;
        if (result.length === 1){
          result[0].challenges = JSON.parse(result[0].challenges);
          res.json(result[0]);
        } else {
          res.json({
            "name": "Not found",
            "challenges": []
          });
        }
      }
    );
  });
});


router.post("/:year/:day", function (req, res, next) {
  
  if (!req.params.year || !req.params.day || !req.body.userid){
    res.sendStatus(400);
    return;
  }
  sql.connect(config, function (err) {
    if (err) console.log(err);
    var request = new sql.Request();
    

    let start = new Date(req.body.startTime);
    let starOne = null;
    let starTwo = null;

    if (req.body.starOne){
      starOne = new Date(req.body.starOne);
      if (starOne - start < 2000){
        starOne = null;
      }
    }
    if (req.body.starTwo){
      starTwo = new Date(req.body.starTwo);
      if (starTwo - start < 2000){
        starTwo = null;
      }
    }

    request.input("uid", req.body.userid.slice(0, 36));
    request.input("yr", req.params.year);
    request.input("dy", req.params.day);
    request.input("sTime", req.body.startTime);
    request.input("star1", starOne);
    request.input("star2", starTwo);

    request.query(`
      EXEC updateProgress
        @userid = @uid,
        @year = @yr,
        @day = @dy,
        @startTime = @sTime,
        @starOne = @star1,
        @starTwo = @star2
    `, (err, result) => {
      if (err) {
        console.log(err);
        res.sendStatus(500);
        return;
      }
      res.sendStatus(201);
    });

  });
});

module.exports = router;
