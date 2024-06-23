const express = require('express');
const path = require('path');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

var serviceAccount = require("./keys.json");
initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function (req, res) {
  res.sendFile(__dirname + "/loginup.html");
});

app.post("/login_s", async function(req, res) {
  console.log(req.body);
  const { email, password } = req.body;
  try {
    const usersRef = db.collection('signup_s');
    const snapshot = await usersRef.where('email', '==', email).get();

    if (snapshot.empty) {
      console.log('No matching documents.');
      res.send('<script>alert("User authentication details do not match. Go back and re-enter correct details."); window.history.back();</script>');
    } else {
      const userDoc = snapshot.docs[0];
      const userData = userDoc.data();
      const isPasswordMatch = await bcrypt.compare(password, userData.password);

      if (isPasswordMatch) {
        console.log('User found');
        const docRef = await db.collection('login_s').add(req.body);
        console.log('Document written with ID: ', docRef.id);
        res.redirect('/main.html');
      } else {
        console.log('Password does not match.');
        res.send('<script>alert("User authentication details do not match. Go back and re-enter correct details."); window.history.back();</script>');
      }
    }
  } catch (error) {
    console.error('Error checking document: ', error);
    res.status(500).send('Error checking login data');
  }
});

app.post("/signup_s", async function(req, res) {
  console.log(req.body);
  const { email, password, name, age } = req.body;

  try {
    const usersRef = db.collection('signup_s');
    const snapshot = await usersRef.where('email', '==', email).get();

    if (!snapshot.empty) {
      console.log('Email already exists.');
      res.send('<script>alert("Email already exists. Please use a different email."); window.history.back();</script>');
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = { email, password: hashedPassword, name, age };
      const docRef = await db.collection('signup_s').add(newUser);
      console.log('Document written with ID: ', docRef.id);
      res.send('<script>alert("Signup data saved successfully. Please login now."); window.location.href="/";</script>');
    }
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
