const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');

const app = express();

// The application will use port 3000 using the localhost loopback
const port = 3000;

// Imports the database connection function
const connectDB = require('./config/db.js');

// Import the User Schema
const User = require('./model/user.model.js');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// For CSS
app.use(express.static(path.join(__dirname, 'public')));

app.engine('hbs', exphbs.engine({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views', 'layouts'),
    partialsDir: path.join(__dirname, 'views', 'partials')
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use('/', require('./routes/auth.routes.js'));

connectDB()
    .then(data=> {
        console.log('Database connected successfully');
        
        app.listen(port, () => {
            console.log(`Server is running at http://localhost:${port}`);
        });
}).catch(err => console.error('Database connection failed:', err));
