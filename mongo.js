const mongoose = require('mongoose')

let argLength = process.argv.length
if(argLength < 3) {
  console.log('Please provide the mongo password: node mongo.js <password>')
  process.exit(1)
}
if(argLength === 4 || argLength > 5) {
  console.log('Please provide all arguments: node mongo.js <password> <name> <number>')
  process.exit(1)
}

const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

const url =
  `mongodb+srv://fullstack:${password}@cluster0.y42xl.mongodb.net/phonebook-app?retryWrites=true&w=majority`

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true})

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
  date: Date,
})

const Person = mongoose.model('Person', personSchema)

if(!name) {

  Person.find({}).then(result => {
    console.log('Phonebook')
    result.forEach(person => {
      console.log(`${person.name}\t${person.number}`)
    })
    mongoose.connection.close()
  })

} else {

  const person = new Person({
    name: name,
    number: number,
    date: new Date(),
  })

  person.save().then(result => {
    console.log(`${name} saved with the number ${number}!`)
    mongoose.connection.close()
  })

}

