const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const TokenSchema = new mongoose.Schema({
  token: { 
    type: String, 
    default: () => uuidv4() // Auto-populate with a new UUID
  },
  data: { 
    type: Object,
    default: () => ({}) // Initialize as an empty object
  }
});

module.exports.Token = mongoose.model('Token', TokenSchema);
