const mongoose = require('mongoose')
const devenv = require('dotenv')

process.on('uncaughtException', (err) => {
    console.log(err.name, err.message)
    console.log('UNCAUGHT EXCEPTION !!  Shuting Down...')
    process.exit(1)
})

devenv.config({ path: './config.env' })
const app = require('./app')

const DB = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
)

mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    })
    .then(() => console.log('DB connection sucessful!'))

// Starting Server
const port = process.env.PORT || 3000
const server = app.listen(port, () => {
    console.log(`listening to the port ${port} ...`)
})

process.on('unhandledRejection', (err) => {
    console.log(err.name, err.message)
    console.log('UNHANDELED REJECTION !!  Shuting Down...')
    server.close(() => {
        process.exit(1)
    })
})
