const express = require('express')
const Opening = require('../models/opening')
const auth = require('../middleware/auth')
const authRecruiter = require('../middleware/authRecuiter')
const authApplicant = require('../middleware/authApplicant')

const router = new express.Router()

//posting openigns by recruiter
router.post('/opening', authRecruiter, async (req, res) => {
      const opening = new Opening({
            ...req.body,
            recruiter : req.user._id
      }) 
      try {
            await opening.save()
            const openingDetails = opening.toObject()
            openingDetails.recruiter = req.user
            res.send(openingDetails)
      } catch (error) {
            res.status(400).send(error)
      }
})

//get one opening by id
router.get('/opening/:id', auth, async (req, res) => {
      try {
            const opening = await Opening.findOne({_id : req.params.id, recruiter: req.user._id})
            
            if(!opening) {
                  return res.status(404).send()
            }
            await opening.save()
            const openingDetails = opening.toObject()
            openingDetails.recruiter = req.user
            res.send(openingDetails)
      } catch (error){
            res.status(400).send(error)
      }
})

//update an opening by id
router.patch('/opening/:id', authRecruiter, async (req, res) => {
      const updates = Object.keys(req.body)
      const allowedUpdates = ['title' , 'description', 'experience', 'skills']
      const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
      if(!isValidOperation) {
            return res.status(400).send({error : 'Invalid updates!'})
      }
      try {

            const opening = await Opening.findOne({_id : req.params.id, recruiter: req.user._id})            
            if(!opening) {
                  return res.status(404).send()
            }

            updates.forEach((update) => opening[update] = req.body[update])
            await opening.save()
            
            const openingDetails = opening.toObject()
            openingDetails.recruiter = req.user
            res.send(openingDetails)
      } catch (error){
            res.status(400).send(error)
      }
})

//delete opening by id 
router.delete('/opening/:id', authRecruiter, async (req, res) => {
      try { 
            const opening = await Opening.findOneAndDelete({_id: req.params.id, recruiter : req.user._id})
            if(!opening) {
                  return res.status(404).send()
            }
            res.send({deleted : true})
      } catch (e) {
            res.status(400).send(e)
      }
})

//get all openings by the recruiter
router.get('/openings/me', authRecruiter, async (req, res) => {
      try {
            const openings = await Opening.find({recruiter : req.user._id})
            res.send(openings)
      } catch (e) {
            res.status(400).send(e)
      }
})

//search openings by title
router.get('/openings', authApplicant, async (req, res) => {
      const query = req.query.search
      try {
            const openings = await Opening.find({ title : new RegExp(query, 'i')})
            res.send(openings)

      } catch (e) {
            res.status(400).send(e)
      }

      res.send()
})

//search openings by filter of expereince and skills
router.post('/openings', authApplicant, async (req, res) => {
      const match = {}

      if (req.body.skills) {
            match.skills = req.body.skills
      }
      if(req.body.experience) {
            match.experience = req.body.experience
      }

      try {
            const opening = await Opening.find(match)
            res.send(opening)
      } catch (error) {
            res.status(404).send()
      }
})


module.exports = router