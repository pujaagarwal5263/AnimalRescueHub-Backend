const express = require('express');
const router = express.Router();
const controllers = require("../controllers/controllers")
const isAuthenticated = require("../middlewares/verify-token");

router.get('/', controllers.hello);
router.post('/login',controllers.login);
router.post('/signup',controllers.signup);
router.post('/admin-login',controllers.adminLogin);
router.post('/orders',controllers.paymentIntegration);

// report a new case
router.post('/report-animal',isAuthenticated,controllers.addAnimalReport);

// get own cases
router.get("/get-my-reports", isAuthenticated, controllers.getUserAnimalReports);

//update your own animal report
router.post("/update-my-report", isAuthenticated, controllers.updateAnimalReportByUser);

//delete your own report
router.post('/delete-report', isAuthenticated, controllers.deleteAnimalReportById);

// get all reports in organization
router.get('/get-all-reports',controllers.getAllAnimalReports);

// track report by ID
router.post("/track", controllers.getUpdateArrayByReportId);

// get report by ID
router.get("/get-report-by-id/:reportId",isAuthenticated,controllers.getReportByID)

//admin updates report
router.post('/admin-update-report', isAuthenticated, controllers.updateAnimalReportByAdmin);

module.exports = router;
