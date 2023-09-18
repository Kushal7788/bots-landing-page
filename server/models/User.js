const mongoose = require('mongoose');

const User = new mongoose.Schema({
    userId: {
      type: String,
      default: null
    },
    data: {
      type: Object,
      default: () => ({})
    }
  });
  
  module.exports.User = mongoose.model('TelegramUser', User);