const express = require('express')
const Submission = require('../models/submission')
const auth = require('../middleware/auth')
const authRecruiter = require('../middleware/authRecuiter')
const authApplicant = require('../middleware/authApplicant')
const multer = require('multer')


const router = new express.Router()

//apply for a job
router.post('/apply/:id', authApplicant, async (req, res) => {
      const submission = new Submission({
            ...req.body,
            applicant : req.user._id,
            opening : req.params.id
      }) 
      console.log(submission)
      try {
            await submission.save()
            res.send(submission)
            
      } catch (e) {
            res.status(400).send()
      }
})

//update your application
router.patch('/submission/:id', authApplicant, async (req, res) => {
      const updates = Object.keys(req.body)
      const allowedUpdates = ['name' , 'email']
      const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
      if(!isValidOperation) {
            return res.status(400).send({error : 'Invalid updates!'})
      }
      const _id = req.params.id
      try {
            const submission = await Submission.findById(_id)  
            if(!submission) {
                  return res.status(404).send()
            }
            updates.forEach((update) => submission[update] = req.body[update])
            await submission.save()
            
            res.send(submission)
      } catch (error){
            res.status(400).send(error)
      }
})

//get all applications for a job
router.get('/submissions/:openingId', authRecruiter, async (req, res) => {
      const pageno = (req.query.pageno) ? Number(req.query.pageno) - 1 : 0
      const pagesize = (req.query.pagesize) ? Number(req.query.pagesize) : 5
      try {
            const submissions = await Submission.find({opening : req.params.openingId}).skip(pageno * pagesize).limit(pagesize)
            res.send(submissions)
      } catch (error) {
            res.status(400).send(error)
      }
})

//get all application of a user
router.get('/submissions/me', authApplicant, async (req, res) => {
      const pageno = (req.query.pageno) ? Number(req.query.pageno) - 1 : 0
      const pagesize = (req.query.pagesize) ? Number(req.query.pagesize) : 5
      try {
            const submissions = await Submission.find({applicant : req.user._id}).skip(pageno * pagesize).limit(pagesize)
            res.send(submissions)
      } catch (error) {
            res.status(400).send(error)
      }
})

const uploadPDF = multer({
      limits: {
            fileSize: 10000000
      },
      fileFilter(req, file, cb) {
            if(!file.originalname.match(/\.pdf$/)){
                  return cb(new Error('Please upload a PDF.'))
            }

            cb(undefined, true)
      }
})

//upload pdf
router.post('/uploadpdf/:subid', authApplicant, uploadPDF.single('upload'), async (req, res) => {
      const _id = req.params.subid
      const submission = await Submission.findById(_id)
      submission.resume = req.file.buffer
      await submission.save()
      res.send('uploaded')
}, (error, req, res, next) => {
      res.status(400).send({error : error.message})
})

const uploadMD = multer({
      limits: {
            fileSize: 10000000
      },
      fileFilter(req, file, cb) {
            if(!file.originalname.match(/\.md$/)){
                  return cb(new Error('Please upload a markdown file.'))
            }

            cb(undefined, true)
      }
})

router.post('/uploadmd/:subid', authApplicant, uploadMD.single('upload'), async (req, res) => {
      const _id = req.params.subid
      const submission = await Submission.findById(_id)
      submission.cover = req.file.buffer
      await submission.save()
      res.send('uploaded')
}, (error, req, res, next) => {
      res.status(400).send({error : error.message})
})




module.exports = router