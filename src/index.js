const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const openingRouter = require('./routers/opening')
const submissionRouter = require('./routers/submission')


const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(userRouter)
app.use(openingRouter)
app.use(submissionRouter)

app.listen(port, () => {
      console.log(`server is up on port ${port}`)
})


