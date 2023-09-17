const User = require("../models/userSchema");
const animalReport = require("../models/animalReportSchema");
const Admin = require("../models/adminSchema");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedTime =
      hours % 12 + ":" + minutes + " " + ampm;
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
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // If the passwords match, generate a JWT token and send it in the response
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const adminLogin = async(req,res) =>{
  try {
    const { email, password } = req.body;
    const user = await Admin.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // If the passwords match, generate a JWT token and send it in the response
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

const signup = async (req, res) => {
  try {
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
    const animalReports = await animalReport.find();
    return res.status(200).json(animalReports);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const addAnimalReport = async (req, res) => {
  try {
    const {
      email,
      locationURL,
      landmark,
      animalName,
      breed,
      condition,
      imageUrls,
    } = req.body;

    const user = await User.findOne({ email });
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
    // forced to send in params as react does not allow body in GET
    const { email } = req.params;
    const user = await User.findOne({ email });
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
    await existingReport.remove();

    return res.status(200).json({ message: "Animal report deleted successfully" });
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
  
      return res.status(200).json({ message: "Animal report updated successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };

const getUpdateArrayByReportId = async (req, res) => {
    try {
      const { reportId } = req.params;
  
      const foundAnimalReport = await AnimalReport.findById(reportId);
      if (!foundAnimalReport) {
        return res.status(404).json({ message: "Animal report not found" });
      }
  
      // Get the update array from the animal report and format the timestamps
      const updateArray = foundAnimalReport.updatesArray.map((update) => ({
        ...update._doc,
        updateTime: formatDateTime(update.updateTime), 
      }));
  
      return res.status(200).json(updateArray);
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
        foundAnimalReport.imageUrls = [...foundAnimalReport.imageUrls, ...req.body.newURLs];
      }
  
      // Save the updated animal report
      await foundAnimalReport.save();
  
      return res.status(200).json({ message: "Animal report updated successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = { hello, login, signup, adminLogin, getAllAnimalReports, getUserAnimalReports, addAnimalReport, deleteAnimalReportById,  getUpdateArrayByReportId, updateAnimalReportByUser, updateAnimalReportByAdmin };
