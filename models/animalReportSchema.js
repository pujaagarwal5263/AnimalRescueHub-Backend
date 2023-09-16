const mongoose = require('mongoose');

const updateSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
  },
  updateTime: {
    type: Date,
    required: true,
  },
  remark: String,
});

const animalReportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  locationURL: {
    type: String,
    required: true
  },
  landmark: {
    type: String,
    required: true,
  },
  animalName: {
    type: String,
    required: true,
  },
  breed: {
    type: String,
    required: true,
  },
  condition:  {
    type: String,
    required: true,
  },
  imageUrls: {
    type: [String],
    required: true,
  },
  status:{
    type: String,
    default: "Unresolved"
  },
  updatesArray: [updateSchema], // Array of update objects
});

const AnimalReport = mongoose.model('AnimalReport', animalReportSchema);

module.exports = AnimalReport;
