require("dotenv").config({ path: "./sample.env" });
const mongoose = require("mongoose");
mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Schema = mongoose.Schema;
const userSchema = new Schema({
  username: String,
  log: [{ description: String, duration: Number, date: Date }],
});

let User = mongoose.model("UserExer", userSchema);

const addUser = (username, done) => {
  let u = new User({
    username: username,
  });
  u.save((err, data) => {
    if (err) return console.error(err);
    done(null, data);
  });
};

const findAllUsers = (done) => {
  User.find({}, { log: 0 }, (err, docs) => {
    if (err) return console.error(err);
    done(null, docs);
  });
};

const addExercice = (idu, desc, dur, dat, done) => {
  let d;
  if (isValidDate(dat)) {
    d = new Date(dat);
  } else {
    d = new Date();
  }

  User.updateOne(
    { _id: idu },
    { $push: { log: { description: desc, duration: dur, date: d } } },
    (err, docs) => {
      if (err) return console.error(err);
      done(null, docs);
    }
  );
};

const findUserLogs = (idu, done) => {
  User.findOne(
    {
      _id: idu,
    },
    (err, docs) => {
      if (err) return console.error(err);
      done(null, docs);
    }
  );
};

function isValidDate(dateString) {
  if (!/^\d{4}\-\d{1,2}\-\d{1,2}$/.test(dateString)) return false;

  var parts = dateString.split("-");
  var day = parseInt(parts[2], 10);
  var month = parseInt(parts[1], 10);
  var year = parseInt(parts[0], 10);

  if (year < 1000 || year > 3000 || month == 0 || month > 12) return false;

  var monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  if (year % 400 == 0 || (year % 100 != 0 && year % 4 == 0))
    monthLength[1] = 29;

  return day > 0 && day <= monthLength[month - 1];
}

exports.userModel = User;
exports.addUser = addUser;
exports.findAllUsers = findAllUsers;
exports.addExercice = addExercice;
exports.findUserLogs = findUserLogs;
exports.isValidDate = isValidDate;
