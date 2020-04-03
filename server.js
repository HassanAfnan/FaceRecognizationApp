const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

const db = knex({
  client:'pg',
  connection: {
    host: '127.0.0.1',
    user: 'postgres',
    password: 'afnan',
    database: 'smartbrain'
  }
});

const app = express();
app.use(bodyParser.json());
app.use(cors());

const database = {
	users:[
      {
        id:'123',
        name:'John',
        email:'John@gmail.com',
        password:'cookies',
        entries: 0,
        joined: new Date()
      },
      {
        id:'124',
        name:'Sally',
        email:'Sally@gmail.com',
        password:'bananas',
        entries: 0,
        joined: new Date()
      }
	]
}

app.get('/',(req,res) => {
	res.send(database.users);
})

app.post('/signin',(req,res) => {
	db.select('email','hash').from('login')
    .where('email','=',req.body.email)
    .then(data => {
      const isValid = bcrypt.compareSync(req.body.password,data[0].hash);
      if(isValid){
        return db.select('*').from('users')
          .where('email','=',req.body.email)
          .then(user => {
            res.json(user[0])
          })
          .catch(err => res.status(400).json('Unable to get user'))
      }
      else
      {
        res.status(400).json('Wrong credential')
      }
    })
    .catch(err => res.status(400).json('Empty credential'))
  // if(req.body.email === database.users[0].email &&
	//    req.body.password === database.users[0].password){
	// 	res.json(database.users[0]);
	// }
	// else
	// {
	// 	res.status(400).json('error logging in');
	// }
})

app.post('/register',(req,res) => {
	const {email,name,password} = req.body;
  const hash = bcrypt.hashSync(password);
  db.transaction(trx => {
    trx.insert({
      hash: hash,
      email: email
    })
    .into('login')
    .returning('email')
    .then(loginEmail => {
        return trx('users')
       .returning('*')
       .insert({
        email: loginEmail[0],
        name: name,
        joined: new Date()
      })
      .then(user => {
        res.json(user[0]);
      })
    })
    .then(trx.commit)
    .catch(trx.rollback)
  })
  .catch(err => res.status(400).json('Unable to register'))
	// database.users.push({
	//       id:'125',
 //        name:name,
 //        email:email,
 //        // password:password,
 //        entries: 0,
 //        joined: new Date()	
	// })
})

app.get('/profile/:id',(req,res) => {
  const { id } = req.params;
  db.select('*').from('users').where({id})
   .then(user => {
      if(user.length){
        res.json(user[0])
      }
      else
      {
        res.status(400).json('Not Found');
      }
   })
   .catch(err => res.status(400).json('Not Found'));
  // if(!found){
  //   res.status(400).json('Not Found');
  // }
})

app.put('/image',(req,res) => {
  const { id } = req.body;
  db('users').where('id','=',id)
  .increment('entries',1)
  .returning('entries')
  .then(entries => {
    res.json(entries[0]);
  })
  .catch(err => res.status(400).json('Unable to get entries'))
})

app.listen(3000, () => {
	console.log('app is running on port 3000');
})

/*
  --> res = this is working
  --> signin = post = success/fail
  --> register = post = user
  --> profile userid = get user
  --> image = put = user
*/