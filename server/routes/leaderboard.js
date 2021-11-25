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
      SELECT year, day, username, startTime, starOne, starTwo FROM user_leaderboards ul
        INNER JOIN challenges ON challenges.userid = ul.userid
        INNER JOIN users ON users.userid = ul.userid
      WHERE
        (leaderboardId = @leaderboardId OR @leaderboardId IS NULL)
        AND
        (year = @year OR @year IS NULL)
        AND 
        (day = @day OR @day IS NULL)
    `,
      function (err, recordset) {
        if (err){
          console.log(err);
          res.sendStatus(500);
          return;
        }
        res.json(recordset.recordsets[0]);
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
    
    request.input("uid", req.body.userid.slice(0, 36));
    request.input("yr", req.params.year);
    request.input("dy", req.params.day);
    request.input("sTime", req.body.startTime);
    request.input("star1", req.body.starOne);
    request.input("star2", req.body.starTwo);
    
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
