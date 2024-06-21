const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://teepukhan729:5avxDdPmQDkk3fyI@paper.prpygdq.mongodb.net/?retryWrites=true&w=majority');
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1); 
  }
};

module.exports = connectDB;
