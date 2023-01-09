const jwt = require('jsonwebtoken')
const User = require('../models/user')

const authRecruiter = async (req, res, next) => {
      try {
            const token = req.header('Authorization').replace('Bearer ', '')
            const decoded = jwt.verify(token, 'this_is_some_string')
            const user = await User.findOne({_id : decoded._id, 'tokens.token' : token})
            if (!user) {
                  throw new Error()
            }
            if (user.role === 'APPLICANT') {
                  return res.status(403).send({Error : 'You aren\'t logged in as a recruiter'})
            }

            req.token = token
            req.user = user
            next()
      } catch (e) {
            res.status(401).send({error : 'Please authenticate!'})
      }
}

module.exports = authRecruiter