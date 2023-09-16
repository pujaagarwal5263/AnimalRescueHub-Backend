const express = require('express');
const router = express.Router();
const controllers = require("../controllers/controllers")

router.get('/', controllers.hello);
router.post('/login',controllers.login);
router.post('/signup',controllers.signup);

// report a new case
router.post('/report-animal',controllers.addAnimalReport);

// get own cases
router.get("/get-my-reports/:email", controllers.getUserAnimalReports);

//update your own animal report
router.post("/update-my-report", controllers.updateAnimalReportByUser);

//delete your own report
router.post('/delete-report', controllers.deleteAnimalReportById);

// get all reports in organization
router.get('/get-all-reports',controllers.getAllAnimalReports);

// track report by ID
router.get("/get-report-updates/:reportId", controllers.getUpdateArrayByReportId);

//admin updates report
router.post('/admin-update-report', controllers.updateAnimalReportByAdmin);

module.exports = router;
