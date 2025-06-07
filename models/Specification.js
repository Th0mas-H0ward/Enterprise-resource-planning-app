const { Schema, model } = require('mongoose')

const materialSchema = new Schema({
  title: {
    type: String, 
    required: true
  },

  quantity: { 
    type: Number,
    required: true
  },

  price: { 
    type: Number,
    required: true
  }
});

const specificationSchema = new Schema({
  date: { 
    type: String,
    required: true
  },

  provider: { 
    type: String,
    required: true
  },

  email: { 
    type: String,
    required: true
  },

  isPosted: { 
    type: Boolean,
    required: true,
    default: false
  },

  postedDate: { 
    type: Date
  },

  isDeleted: {
    type: Boolean,
    required: true,
    default: false
  },

  isCompleted: {
    type: Boolean,
    required: true,
    default: false
  },

  materials: [materialSchema]
});

module.exports = model('Specification', specificationSchema);

