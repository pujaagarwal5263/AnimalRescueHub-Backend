const mongoose = require('mongoose');
const animalReportSchema = require("./animalReportSchema")

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password:{
    type: String,
    required: true
  },
  city:{
    type: String,
    required: true
  },
  animalReports: [animalReportSchema],
});

const User = mongoose.model('User', userSchema);

module.exports = User;
