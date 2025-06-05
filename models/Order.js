const { Schema, model } = require('mongoose')

const productSchema = new Schema({
  title: {
    type: String, //назва продукту
    required: true
  },

  quantity: { //кількість продуктів
    type: Number,
    required: true
  },

  price: { //ціна продукту
    type: Number,
    required: true
  }
});

const schema = new Schema({
  date: { //Бажана дата доставки замовлення 
    type: String,
    required: true
  },

  customer: {
    type: String,
    required: true
  },

  phone: {
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

  postedDate: { //Дата створення замовлення
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
  
  orderStatus: {
    type: Number,
    required: true,
    default: "1"
  },

  products: [productSchema]
})

module.exports = model('Order', schema)