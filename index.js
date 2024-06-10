const express = require('express');
const path = require('path');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const bodyParser = require('body-parser');

var serviceAccount = require("./keys.json");
initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// app.get("/", function(req, res) {
//   console.log("i am in the st");
//   res.send("<h1 >hi guys get ready</h1>");
// });

app.get('/', function (req, res) {
  res.sendFile(__dirname+"/loginup.html");
});

app.post("/login_s", async function(req, res) {
  console.log(req.body);
  const { email, password} = req.body; 
  try {
    const usersRef = db.collection('signup_s');
    const snapshot = await usersRef.where('email', '==', email).where('password', '==', password).get();   
    
    if (snapshot.empty) {
      console.log('No matching documents.');
      res.send('<script>alert("user authentication detials is not matched.Go back and re-enter correct details");</script>');
    } else {
      console.log('User found');
      const docRef = await db.collection('login_s').add(req.body)
      console.log('Document written with ID: ', docRef.id);
      res.redirect('/main.html');  
    }
  } catch (error) {
    console.error('Error checking document: ', error);
    res.status(500).send('Error checking login data');
  }
 });


app.post("/signup_s", async function(req, res) {
  console.log(req.body);
  try {
    const docRef = await db.collection('signup_s').add(req.body);
    console.log('Document written with ID: ', docRef.id);
    res.send('<script>alert("Signup data saved successfully and login now");</script>');
    
  } catch (error) {
    console.error('Error adding document: ', error);
    res.status(500).send('Error saving signup data');
  }
});


app.get('/main.html', function (req, res) {
  res.sendFile(__dirname + "/main.html");
});


app.listen(7000, () => {
  console.log("Server is running at http://localhost:7000/");
});
