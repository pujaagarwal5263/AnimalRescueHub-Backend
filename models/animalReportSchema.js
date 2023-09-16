const mongoose = require('mongoose');

const animalReportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  latitude: {
    type: String,
    required: true
  },
  longitude:{
    type: String,
    required: true
  },
  location: {
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
  }
});

const AnimalReport = mongoose.model('AnimalReport', animalReportSchema);

module.exports = AnimalReport;
