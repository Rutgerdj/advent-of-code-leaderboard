var express = require("express");
var router = express.Router();
var sql = require("mssql");

var config = {
  user: process.env.DBUSER,
  password: process.env.DBPASSWORD,
  server: process.env.DBSERVER,
  database: process.env.DBNAME,
};


router.get("/:userid/:year?/:day?", function (req, res, next) {
  console.log(req.params);
  sql.connect(config, function (err) {
    if (err){
      console.log(err);
      res.sendStatus(500);
      return;
    }  
    var request = new sql.Request();
    request.input("userId", req.params.userid.slice(0, 36));
    request.input("year", req.params.year);
    request.input("day", req.params.day);
    request.query(
      `
        SELECT 
          userid,
          username,
          profilePic,
          githubPage,
          isNull((
              SELECT users.userid, year, day, startTime, starOne, starTwo FROM challenges
                  WHERE
                      userid = users.userid
                      AND
                      (year = @year OR @year IS NULL)
                      AND
                      (day = @day OR @day IS NULL)
              FOR JSON PATH), '[]'
          ) AS challenges,
          ISNULL((
              SELECT ul.leaderboardId, leaderboard.name FROM user_leaderboards ul
              INNER JOIN leaderboard ON leaderboard.id = ul.leaderboardId
                  WHERE
                      ul.userid = users.userid
              FOR JSON PATH), '[]'
          ) AS leaderboards
      FROM users 
      WHERE 
          userid = @userId
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
          result[0].leaderboards = JSON.parse(result[0].leaderboards);
          res.json(result[0]);
        } else {
          res.sendStatus(404);
        }
      }
    );
  });
});

module.exports = router;
