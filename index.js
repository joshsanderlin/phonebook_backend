/* Best practice for db configs etc */
require('dotenv').config()

/* Major require statements */
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

/* Initialize Express App */
const app = express()

/* Configure Express App */
app.use(cors())
app.use(express.json())
app.use(express.static('build'))

/* Morgan Logging */
morgan.token('jsondata', function (req, res) {
  if(req.method === 'POST') {
    return JSON.stringify(req.body)
  }
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :jsondata'))

/* General Routes */
app.get('/', (request, response) => {
  response.send('<h1>PhoneBook API</h1>')
})

app.get('/info', (request, response) => {
  Person.find({}).then(people => {
    let now = new Date()
    response.send(
      `<h1>PhoneBook Info</h1><p>Number of contacts: ${people.length}<p><p>${now.toString()}</p>`
    )
  })
})

/* People Routes */
const Person = require('./models/person')
const note = require('../notes_backend/models/note')

app.get('/api/people', (request, response) => {
  Person.find({}).then(people => {
    response.json(people)
  })
})

app.get('/api/people/:id', (request, response, next) => {
  Person
    .findById(request.params.id)
    .then(person => {
      if(person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.post ('/api/people', (request, response) => {
  const body = request.body

  /* validate person name */
  if(!body.name) {
    return response.status(400).json({
      error: "name missing"
    })
  }
  /* validate person number */
  if(!body.number) {
    return response.status(400).json({
      error: "number missing"
    })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
    date: new Date(),
  })

  person.save().then(savedPerson => {
    response.json(savedPerson)
  })
})

app.put('/api/people/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person
    .findByIdAndUpdate(request.params.id, person, {new: true})
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

app.delete('/api/people/:id', (request, response, next) => {
  Person
    .findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

/* Catch all for undefined routes */
const unknownEndpoint = (request, response) => {
  response.status(404).send({error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

/* Error handling middleware to catch malformed id's */
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if(error.name === 'CastError') {
    return response.status(400).send({error: 'malformed id'})
  }

  next(error)
}

app.use(errorHandler)

/* App/Route configuration complete, let's start the server! */
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
