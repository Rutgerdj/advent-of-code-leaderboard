const { v4: uuidv4 } = require('uuid');
var express = require("express");
var router = express.Router();
var leaderboardRouter = require('./leaderboard');
var sql = require("mssql");


var config = {
  user: process.env.DBUSER,
  password: process.env.DBPASSWORD,
  server: process.env.DBSERVER,
  database: process.env.DBNAME,
};


router.get("/registerExt", function (req, res, next) {
  sql.connect(config, function (err) {
    if (err) {
      console.log(err);
      res.sendStatus(500).send("Server error");
      return;
    }

    var request = new sql.Request();
    let uuid = uuidv4();
    request.input("uuid", uuid);
    request.query(`
      SELECT top 1 username FROM users WHERE userid = @uuid
    `, (err, recordsset) => {
      if (err) {
        console.log(err);
        res.sendStatus(500).send("Server error");
        return
      };
      if (recordsset.recordset.length > 0){
        console.log("uuid already found");
        uuid = uuidv4();
      }
      res.send(uuid);
    });
  });
});

router.post("/setUsername", function (req, res, next) {
  if (!req.body.username || !req.body.userid){
    res.sendStatus(400).send("Wrong data suppplied");
    return;
  }
  sql.connect(config, function (err) {
    if (err) {
      console.log(err);
      res.sendStatus(500).send("Server error");
      return;
    }
    var request = new sql.Request();
    request.input("uname", req.body.username.slice(0, 36));
    request.input("uid", req.body.userid.slice(0, 36));

    request.query(`EXEC updateUserName @userid = @uid, @username=@uname`, (err, result) => {
      if (err) {
        console.log(err);
        res.sendStatus(500).send("Server error");
        return;
      }
      res.sendStatus(201);
    });

  });

})

router.get("/leaderboards", function (req, res, next) {
  sql.connect(config, function (err) {
    if (err){
      console.log(err);
      res.sendStatus(500).send("Server error");
      return;
    }  
    var request = new sql.Request();
    request.query(
      `
      SELECT id from leaderboard;
    `,
      function (err, recordset) {
        if (err){
          console.log(err);
          res.sendStatus(500).send("Server error");
          return;
        }
        res.json(recordset.recordsets[0]);
      }
    );
  });
})

router.get("/users", function (req, res, next) {
  sql.connect(config, function (err) {
    if (err){
      console.log(err);
      res.sendStatus(500).send("Server error");
      return;
    }  
    var request = new sql.Request();
    request.query(`SELECT userid, username from users;`,
      function (err, recordset) {
        if (err){
          console.log(err);
          res.sendStatus(500).send("Server error");
          return;
        }
        res.json(recordset.recordsets[0]);
      }
    );
  });
})

router.use("/leaderboard", leaderboardRouter);

module.exports = router;