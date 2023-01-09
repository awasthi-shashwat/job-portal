const mongoose = require('mongoose')
const validator = require('validator')

const openingSchema = mongoose.Schema({
      title : {
            type : String,
            required : true,
            trim : true
      },
      description : {
            type : String,
            required: true,
            trim: true
      },
      skills : {
            type : Array,
            required : true
      },
      experience : {
            type : Number,
            required : true
      },
      recruiter : {
            type : mongoose.Schema.Types.ObjectId,
            required : true,
            ref: 'User'
      }
}, {
      timestamps : true
})


const Opening = mongoose.model('Opening', openingSchema)

module.exports = Opening