const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('../models/task')

const userSchema = new mongoose.Schema({
      name : {
            type : String,
            required: true,
            trim : true
      },
      email : {
            type : String,
            trim : true,
            unique : true,
            lowercase: true,
            required : true,
            validate(value) {
                  if(!validator.isEmail(value)){
                        throw new Error('Email is invalid.')
                  }
            }
      },
      password : {
            type : String,
            trim : true,
            required : true,
            minLength: 7,
            validate(value) {
                  if (value.toLowerCase().includes('password')){
                        throw new Error('Password cannot contain "password".')
                  }
            }
      },
      tokens : [{
            token: {
                  type : String,
                  required: true
            }
      }],
      role : {
            type : String,
            validate(value) {
                  if (!(value === 'APPLICANT' || value === 'RECRUITER')) {
                        throw new Error('Not a valid role.')
                  }
            }
      },
      avatar : {
            type : Buffer
      }
},{   
      virtuals : true,  
      timestamps: true,
})

userSchema.virtual('tasks', {
      ref : 'Task',
      localField : '_id',
      foreignField : 'owner',
      justOne : false
})


userSchema.methods.generateAuthToken = async function () {
      const user = this
      const token = await jwt.sign({ _id : user._id.toString()}, 'this_is_some_string')
      user.tokens = user.tokens.concat({token : token})
      await user.save()

      return token
}

userSchema.methods.toJSON = function () {
      const user = this
      const userObject = user.toObject()

      delete userObject.password
      delete userObject.tokens
      delete userObject.avatar
      delete userObject.role

      return userObject
}


userSchema.statics.findByCredentials = async (email, password) => {
      const user = await User.findOne({ email })

      if (!user) {
            throw new Error('Unable to login!')
      }

      const isMathched = await bcrypt.compare(password, user.password)

      if(!isMathched) {
            throw new Error('Unable to login!')
      }

      return user
}


//Hash the plain text password before saving
userSchema.pre('save', async function (next) {
      const user = this

      if (user.isModified('password')) {
            user.password = await bcrypt.hash(user.password, 8)
      }

      next()
})

//Delete user tasks when user is removed
userSchema.pre('remove', async function (next) {
      const user = this
      await Task.deleteMany({owner : user._id})
      next()
})


const User = mongoose.model('User', userSchema)

module.exports = User