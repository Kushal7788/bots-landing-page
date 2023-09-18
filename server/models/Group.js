const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
  groupId: { 
    type: String, 
  },
  groupTitle: {
    type: String,
  },
  data: { 
    type: Object,
    default: () => ({}) // Initialize as an empty object
  }
});

module.exports.Group = mongoose.model('Group', GroupSchema);
