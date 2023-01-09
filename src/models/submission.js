const mongoose = require('mongoose')

const submissionSchema = mongoose.Schema({
      name : {
            type : String,
            required : true,
            trim : true
      },
      email : {
            type : String,
            required: true,
            trim: true
      },
      resume : {
            type : Buffer,
      },
      cover : {
            type : Buffer,
      },
      opening : {
            type : mongoose.Schema.Types.ObjectId,
            ref: 'User'
      },
      applicant : {
            type : mongoose.Schema.Types.ObjectId,
            ref: 'User'
      }
}, {
      timestamps : true
})


const Submission = mongoose.model('Submission', submissionSchema)

module.exports = Submission