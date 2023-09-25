const User = require("../models/userSchema");
const animalReport = require("../models/animalReportSchema");
const Admin = require("../models/adminSchema");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Razorpay = require("razorpay");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose")

const sendEmail = async (mailOptions) => {
  const transporter = await nodemailer.createTransport({
    service: process.env.MAIL_SERVICE,
    auth: {
      user: process.env.PLATFORM_EMAIL,
      pass: process.env.APP_PASSWORD,
    },
  });

  const info = await transporter.sendMail(mailOptions);
  console.log(`Message sent with ID ${info.messageId}`);
};
const formatDateTime = (timestamp) => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedTime = (hours % 12) + ":" + minutes + " " + ampm;
  return `${year}-${month}-${day} ${formattedTime}`;
};

const hello = (req, res) => {
  res.json({ message: "Hello, World!" });
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // If the passwords match, generate a JWT token and send it in the response
    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(200).json({ message: "Login Successful",userID: user._id, name: user.name, email: user.email, token: token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Admin.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const isPasswordValid = password == user.password;
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // If the passwords match, generate a JWT token and send it in the response
    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(200).json({ token: token, message: "Admin Login Successful" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const signup = async (req, res) => {
  try {
    console.log("object");
    const { name, email, password, city } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      city,
      animalReportIDs: [],
    });

    await newUser.save();

    return res.status(200).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getAllAnimalReports = async (req, res) => {
  try {
    const animalReports = await animalReport.find().populate('reporter', 'name');
    return res.status(200).json(animalReports);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getReportByID = async (req, res) =>{
  try{
    const { reportId } = req.params;
    const objectId = new mongoose.Types.ObjectId(reportId);

    const foundAnimalReport = await animalReport.findById(reportId).populate('reporter', 'name');
    if (!foundAnimalReport) {
      return res.status(201).json({ message: "Animal report not found" });
    }
    return res.status(200).json({message:"Updates fetched successfully",report: foundAnimalReport});
  }catch(err){
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

const addAnimalReport = async (req, res) => {
  try {
    const {
      locationURL,
      landmark,
      animalName,
      breed,
      condition,
      imageUrls,
    } = req.body;

    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create a new animal report and associate it with the user
    const newAnimalReport = new animalReport({
      reporter: user._id,
      locationURL,
      landmark,
      animalName,
      breed,
      condition,
      imageUrls,
    });

    await newAnimalReport.save();
    user.animalReportIDs.push(newAnimalReport._id);
    await user.save();

    const mailOptions = {
      from: "Animal Rescue Hub",
      to: req.user.email,
      subject: "New Animal Rescue Report Filed!",
      html: `<div>
     <h2>Greetings for the day!</h2>
     <h3>Thanks for joining hands with us on a mission to create a better world for all creatures.</h3>
     <p>You have reported a Animal Rescue Case with Report Ref: ${newAnimalReport._id}</p>
     <p>We'll keep you posted on this.</p>
     <p>You can also keep track of your report with this reference number.</p>
     <hr/>
     <p><i><b>
     Regards, <br/>
     Animal Rescue Hub
     </b></i></p>
     </div>`,
    };

    await sendEmail(mailOptions);

    return res.status(200).json({
      message: "Animal report created successfully",
      reportId: newAnimalReport._id,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getUserAnimalReports = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const animalReports = await animalReport.find({ reporter: user._id });
    return res.status(200).json(animalReports);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteAnimalReportById = async (req, res) => {
  try {
    const { reportId } = req.body;
    const existingReport = await animalReport.findById(reportId);

    if (!existingReport) {
      return res.status(404).json({ message: "Animal report not found" });
    }
    await existingReport.deleteOne({ _id: reportId });

    return res
      .status(200)
      .json({ message: "Animal report deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

//accessible to admin
const updateAnimalReportByAdmin = async (req, res) => {
  try {
    const { reportId, status, remark } = req.body;

    const foundAnimalReport = await animalReport.findById(reportId);
    if (!foundAnimalReport) {
      return res.status(404).json({ message: "Animal report not found" });
    }

    foundAnimalReport.updatesArray.push({
      status,
      updateTime: new Date(), // Store the current timestamp
      remark,
    });

    foundAnimalReport.status = status;
    await foundAnimalReport.save();

    const reporterId = foundAnimalReport.reporter;
    const reporter = await User.findById(reporterId);
    if (!reporter) {
      return res.status(404).json({ message: "Reporter not found" });
    }
    const reporterEmail = reporter.email;

    const mailOptions = {
      from: "Animal Rescue Hub",
      to: reporterEmail,
      subject: "Update on your animal Report",
      html: `<div>
     <h2>Greetings for the day!</h2>
     <p>You have an update on Animal Rescue Report Ref: ${reportId}</p>
     <p>Status was changed to <b>${status}</b> with following remarks:</p>
     <i>${remark}</i>
     <hr/>
     <p><i><b>
     Regards, <br/>
     Animal Rescue Hub
     </b></i></p>
     </div>`,
    };

    await sendEmail(mailOptions);
    return res
      .status(200)
      .json({ message: "Animal report updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getUpdateArrayByReportId = async (req, res) => {
  try {
    const { reportId } = req.body;
    const objectId = new mongoose.Types.ObjectId(reportId);

    const foundAnimalReport = await animalReport.findById(objectId);
    if (!foundAnimalReport) {
      return res.status(201).json({ message: "Animal report not found" });
    }

    // Get the update array from the animal report and format the timestamps
    const updateArray = foundAnimalReport.updatesArray.map((update) => ({
      ...update._doc,
      updateTime: formatDateTime(update.updateTime),
    }));

    return res.status(200).json({message:"Updates fetched successfully",updates: updateArray});
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateAnimalReportByUser = async (req, res) => {
  try {
    const { reportId } = req.body;
    const updateFields = {};

    // Optional fields that may be updated
    const optionalFields = [
      "locationURL",
      "landmark",
      "animalName",
      "breed",
      "condition",
      "newURLs",
    ];

    // Check if each optional field exists in the request body and update if provided
    optionalFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
      }
    });

    const foundAnimalReport = await animalReport.findById(reportId);
    if (!foundAnimalReport) {
      return res.status(404).json({ message: "Animal report not found" });
    }

    // Update the animal report fields if provided
    Object.assign(foundAnimalReport, updateFields);

    // Append new URLs to the existing imageUrls array if provided
    if (req.body.newURLs) {
      foundAnimalReport.imageUrls = [
        ...foundAnimalReport.imageUrls,
        ...req.body.newURLs,
      ];
    }

    // Save the updated animal report
    await foundAnimalReport.save();

    return res
      .status(200)
      .json({ message: "Animal report updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const paymentIntegration = async (req, res) => {
  try {
    const { amount } = req.body;
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: amount,
      currency: "INR",
      // receipt: "receipt_order_74394",
    };

    const order = await instance.orders.create(options);

    if (!order) return res.status(500).send("Some error occured");

    return res.json(order);
  } catch (error) {
    return res.status(500).send(error);
  }
};

module.exports = {
  hello,
  login,
  signup,
  adminLogin,
  getAllAnimalReports,
  paymentIntegration,
  getUserAnimalReports,
  addAnimalReport,
  deleteAnimalReportById,
  getUpdateArrayByReportId,
  updateAnimalReportByUser,
  updateAnimalReportByAdmin,
  getReportByID
};
