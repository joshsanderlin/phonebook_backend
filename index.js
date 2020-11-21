const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

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

let people = [
  {
    id: 1,
    name: "Josh Sanderlin",
    number: "123-123-1111",
  },
  {
    id: 2,
    name: "Mushu",
    number: "1-800-OLD-DOG5",
  },
  {
    id: 3,
    name: "Bre",
    number: "705-AWK-WARD"
  },
  {
    id: 4,
    name: "Sypha",
    number: "307-CAT-BISH"
  }
]

/* General Routes */

app.get('/', (request, response) => {
  response.send('<h1>PhoneBook API</h1>')
})

app.get('/info', (request, response) => {
  let now = new Date()
  response.send(
    `<h1>PhoneBook Info</h1><p>Number of contacts: ${people.length}<p><p>${now.toString()}</p>`
  )
})

/* People Routes */

app.get('/api/people', (request, response) => {
  response.json(people)
})

app.get('/api/people/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = people.find(p => p.id === id)

  if(person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

const generateId = () => {
  return Math.random() * 100000000000000000
}

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
  /* validate unique name */
  if(people.find(p => p.name === body.name)) {
    return response.status(400).json({
      error: `duplicate name: ${body.name}`
    })
  }

  const person = {
    name: body.name,
    number: body.number,
    id: generateId(),
  }

  people = people.concat(person)

  response.json(person)
})

app.delete('/api/people/:id', (request, response) => {
  const id = Number(request.params.id)
  people = people.filter(p => p.id !== id)

  response.status(204).end()
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
