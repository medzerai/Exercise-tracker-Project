const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config({ path: "./sample.env" });
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: "false" }));
app.use(bodyParser.json());
try {
  mongoose = require("mongoose");
} catch (e) {
  console.log(e);
}

app.use(cors());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

const User = require("./myApp.js").userModel;

const addUser = require("./myApp.js").addUser;
app.post("/api/users", function (req, res) {
  let u = req.body.username;
  User.countDocuments({ username: u }, function (error, n) {
    if (n == 0) {
      addUser(u, function (err, data) {
        if (err) {
          return next(err);
        } else if (!data) {
          console.log("Missing `done()` argument");
          return next({ message: "Missing callback argument" });
        } else {
          res.json({
            username: data.username,
            _id: data._id,
          });
        }
      });
    } else {
      res.format({
        "text/plain": function () {
          res.send("Username already taken");
        },
      });
    }
  });
});

const findAllUsers = require("./myApp.js").findAllUsers;
app.get("/api/users", function (req, res) {
  findAllUsers(function (err, data) {
    if (err) {
      return next(err);
    } else if (!data) {
      console.log("Missing `done()` argument");
      return next({ message: "Missing callback argument" });
    } else {
      res.json(data);
    }
  });
});

const addExercice = require("./myApp.js").addExercice;
app.post("/api/users/:_id/exercises", function (req, res) {
  let i = req.params._id;
  let desc = req.body.description;
  let dur = req.body.duration;
  let dat = req.body.date;

  User.countDocuments({ _id: i }, function (error, n) {
    if (n == 1) {
      addExercice(i, desc, dur, dat, function (err, data) {
        if (err) {
          return next(err);
        } else if (!data) {
          console.log("Missing `done()` argument");
          return next({ message: "Missing callback argument" });
        } else {
          User.findOne(
            { _id: i },
            { __v: 0, "log._id": 0 },
            function (err, docs) {
              var v = docs.log.map((x) => {
                return {
                  description: x.description,
                  duration: x.duration,
                  date: new Date(x.date).toDateString(),
                };
              });
              res.json({
                _id: docs._id,
                username: docs.username,
                date: v[v.length - 1].date,
                duration: v[v.length - 1].duration,
                description: v[v.length - 1].description,
              });
            }
          );
        }
      });
    } else {
      res.format({
        "text/plain": function () {
          res.send(
            'Cast to ObjectId failed for value "' +
              i +
              '" at path "_id" for model "Users"'
          );
        },
      });
    }
  });
});

const isValidDate = require("./myApp.js").isValidDate;
const findUserLogs = require("./myApp.js").findUserLogs;
app.get("/api/users/:_id/logs", function (req, res) {
  let i = req.params._id;
  let r = req.query;
  User.countDocuments({ _id: i }, function (error, n) {
    if (n == 1) {
      findUserLogs(i, function (err, data) {
        if (err) {
          return next(err);
        } else if (!data) {
          console.log("Missing `done()` argument");
          return next({ message: "Missing callback argument" });
        } else {
          var l = data.log.map((x) => {
            return {
              description: x.description,
              duration: x.duration,
              date: new Date(x.date).toDateString(),
            };
          });
          if (
            (r.from && !r.to && isValidDate(r.from)) ||
            (r.from && r.to && isValidDate(r.from) && !isValidDate(r.to))
          ) {
            l = l.filter((x) => new Date(x.date) > new Date(r.from));
            l = l.splice(0, r.limit || Infinity);
            b = {
              _id: data._id,
              username: data.username,
              from: new Date(r.from).toDateString(),
              count: l.length,
              log: l,
            };
          } else if (
            (!r.from && r.to && isValidDate(r.to)) ||
            (r.from && r.to && isValidDate(r.to) && !isValidDate(r.from))
          ) {
            l = l.filter((x) => new Date(x.date) < new Date(r.to));
            l = l.splice(0, r.limit || Infinity);

            b = {
              _id: data._id,
              username: data.username,
              to: new Date(r.to).toDateString(),
              count: l.length,
              log: l,
            };
          } else if (
            r.from &&
            r.to &&
            isValidDate(r.from) &&
            isValidDate(r.to)
          ) {
            l = l.filter(
              (x) =>
                new Date(x.date) > new Date(r.from) &&
                new Date(x.date) < new Date(r.to)
            );
            l = l.splice(0, r.limit || Infinity);
            b = {
              _id: data._id,
              username: data.username,
              from: new Date(r.from).toDateString(),
              to: new Date(r.to).toDateString(),
              count: l.length,
              log: l,
            };
          } else {
            l = l.splice(0, r.limit || Infinity);
            var b = {
              _id: data._id,
              username: data.username,
              count: l.length,
              log: l,
            };
          }
          res.json(b);
        }
      });
    } else {
      res.format({
        "text/plain": function () {
          res.send(
            'Cast to ObjectId failed for value "' +
              i +
              '" at path "_id" for model "Users"'
          );
        },
      });
    }
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
