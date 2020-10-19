const express = require('express');
const app = express();
const mongoose = require('mongoose');
const db = require('./config')(process.env.NODE_ENV);
require('dotenv').config();
const setupController = require('./controllers/setupController');
const apiController = require('./controllers/apiController');
const userController = require('./controllers/userController');
const routes = require('./routes/route.js');
const jwt = require('jsonwebtoken');
const User = require('./models/userModel')



app.use('/assets', express.static(__dirname + '/public'));

//set view engine as ejs
app.set('view engine', 'ejs');

//database connection
mongoose.Promise = global.Promise;
mongoose.connect(db.DATABASE, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false}, (err) => {
    if (err) throw err;
    console.log('database is connected')
});

setupController(app);
apiController(app);

app.use(async (req, res, next) => {
    if (req.cookies["x-access-token"]) {
        const accessToken = req.cookies["x-access-token"];
        const { userId, exp } = await jwt.verify(accessToken, process.env.JWT_SECRET);
     // Check if token has expired
        if(exp < Date.now().valueOf() / 1000) { 
            return res.status(401).json({ error: "JWT token has expired, please login to obtain a new one" });
        } 
        res.locals.loggedInUser = await User.findById(userId);
        next(); 
        } else { 
            next(); 
        } 
});


app.use('/', routes);

//listening port
const PORT = process.env.PORT || 4200;
app.listen(PORT, () => {
    console.log(`app is live at port ${PORT}`)
});