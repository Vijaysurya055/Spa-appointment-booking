const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/Spa', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("Connected to MongoDB");
});

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    fullname: String
});
const feedbackSchema = new mongoose.Schema({
    name:String,
    email:String,
    feedback:String
});
const appointmentSchema = new mongoose.Schema({
    fname: String,
    email:String,
    mob: String,
    service: String,
    date:Date,
    time:String
});

const User = mongoose.model('User', userSchema);
const Appointment = mongoose.model('Appointment', appointmentSchema);
const Feedback=mongoose.model('Feedback',feedbackSchema);
const app = express();

app.use(bodyParser.json());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/signup', function (req, res) {
    const { fullname, username, password } = req.body;
    const newUser = new User({
        fullname,
        username,
        password
    });

    newUser.save()
        .then(() => {
            console.log('User signed up successfully');
            return res.redirect('./login.html');
        })
        .catch(err => {
            console.error(err);
            return res.status(500).send('Error signing up. Please try again.');
        });
});
app.post('/feedback', function (req, res) {
    const { name, email, feedback } = req.body;
    const newFeedback = new Feedback({
        name,
        email,
        feedback
    });

    newFeedback.save()
        .then(() => {
            console.log('Feedback sent successfully');
            return res.redirect('./s1.html');
        })
        .catch(err => {
            console.error(err);
            return res.status(500).send('Error sending feedback. Please try again.');
        });
});
app.post('/login', function (req, res) {
    const { username, password } = req.body;
    User.findOne({ username, password })
        .then(user => {
            if (user) {
                console.log('User logged in successfully');
                return res.redirect('./index.html');
            } else {
                console.log('Invalid credentials. Redirecting to login page.');
                return res.redirect('./login.html');
            }
        })
        .catch(err => {
            console.error(err);
            return res.status(500).send('Error during login. Please try again.');
        });
});
app.get('/feedback', function (req, res) {
    Feedback.find()
        .then(feedback => {
            res.json(feedback);
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Error fetching feedback.');
        });
});
app.post('/book', async function (req, res) {
    const { fname, email, mob, service, date, time } = req.body;
    const count = await Appointment.countDocuments({ service, date });
    const bookingLimit = 5;
    if (count >= bookingLimit) {
        const message = `Booking limit reached for ${service} on ${date}. Please select another date.`;
        return res.status(400).send(`
            <html>
                <head>
                    <title>Booking Error</title>
                </head>
                <body>
                    <p>${message}</p>
                    <a href="book.html">Go back to appointment booking</a>
                </body>
            </html>
        `);
    }
    const newAppointment = new Appointment({
        fname,
        email,
        mob,
        service,
        date,
        time,
    });

    newAppointment.save()
        .then(() => {
            return res.redirect('./success.html');
        })
        .catch(err => {
            return res.status(500).send('Error booking appointment. Please try again.');
        });
});


app.listen(4000, function () {
    console.log("Server listening at port 4000");
});
