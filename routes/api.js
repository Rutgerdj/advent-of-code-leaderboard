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
      res.sendStatus(500)
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
        res.sendStatus(500)
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

router.post("/joinLeaderboard", function (req, res, next) {
  if (!req.body.userid || !req.body.leaderboardId){
    console.log("wrong ata");
    res.sendStatus(400)
  }
  sql.connect(config, function (err) {
    if (err) {
      console.log(err);
      res.sendStatus(500)
      return;
    }
    var request = new sql.Request();
    request.input("uid", req.body.userid);
    request.input("lid", req.body.leaderboardId);
    request.query(`EXEC joinLeaderboard @userid = @uid, @leaderboardId=@lid`, (err, results) => {
      if (err){
        console.log(err);
        res.sendStatus(500)
        return;
      }
      res.sendStatus(200);
    });
  });
});

router.post("/renameLeaderboard", function (req, res, next) {
  if (!req.body.name || !req.body.leaderboardId){
    res.sendStatus(400);
    return;
  } 
  sql.connect(config, function (err) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
      return;
    }
    var request = new sql.Request();
    request.input("n", req.body.name);
    request.input("lid", req.body.leaderboardId);
    request.query(`EXEC renameLeaderboard @leaderboardId=@lid, @name=@n`, (err, results) => {
      if (err){
        console.log(err);
        res.sendStatus(500);
        return;
      }
      res.sendStatus(200);
    });
  });  
});

router.post("/leaveLeaderboard", function (req, res, next) {
  if (!req.body.userid || !req.body.leaderboardId){
    res.sendStatus(400);
    return;
  }
  sql.connect(config, function (err) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
      return;
    }
    var request = new sql.Request();
    request.input("uid", req.body.userid);
    request.input("lid", req.body.leaderboardId);
    request.query(`DELETE FROM user_leaderboards WHERE userid = @uid AND leaderboardId = @lid`, (err, results) => {
      if (err){
        console.log(err);
        res.sendStatus(500);
        return;
      }
      res.sendStatus(200);
    });
  });
});

router.post("/setUsername", function (req, res, next) {
  if (!req.body.username || !req.body.userid){
    res.sendStatus(400);
    return;
  }
  sql.connect(config, function (err) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
      return;
    }
    var request = new sql.Request();
    request.input("uname", req.body.username.slice(0, 36));
    request.input("uid", req.body.userid.slice(0, 36));

    request.query(`EXEC updateUserName @userid = @uid, @username=@uname`, (err, result) => {
      if (err) {
        console.log(err);
        res.sendStatus(500);
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
      res.sendStatus(500);
      return;
    }  
    var request = new sql.Request();
    request.query(
      `
      SELECT id, name from leaderboard;
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
})

router.get("/users", function (req, res, next) {
  sql.connect(config, function (err) {
    if (err){
      console.log(err);
      res.sendStatus(500);
      return;
    }  
    var request = new sql.Request();
    request.query(`SELECT userid, username from users;`,
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
})

router.use("/leaderboard", leaderboardRouter);

module.exports = router;