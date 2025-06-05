const { Schema, model } = require('mongoose')

const schema = new Schema({
  provider: {
    type: String,
    default: true
  },

  phone: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true
  },

  materials: [{
    category: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    }
  }]
});

module.exports = model('Provider', schema)
