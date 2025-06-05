const {Schema, model} = require('mongoose');

const User = new Schema({
  name: {
    type: String, 
    required: true
  },
  
  username: {
    type: String, 
    unique: true, 
    required: true
  },

  password: {
    type: String, 
    required: true
  },
  
  role: {
    type: String, 
    required: true
  }
})

module.exports = model('User', User);