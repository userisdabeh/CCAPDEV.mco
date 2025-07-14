const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const multer = require('multer');
const dayjs = require('dayjs');

const app = express();

//remember-me login
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// Configure dayjs
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);

// Load environment variables
require('dotenv').config();

// The application will use port 3000 using the localhost loopback
const port = 3000;

// Imports the database connection function
const connectDB = require('./controller/config/db.js');

// Import the Schemas
const User = require('./model/user.model.js');
const Room = require('./model/room.model.js');
const Reservation = require('./model/reservation.model.js');

// Import Routes
const authRoutes = require('./controller/routes/auth.routes.js');
const studentRoutes = require('./controller/routes/student.routes.js');

// Import Middleware
const isAuthenticated = require('./controller/middleware/auth.js');

// Import Cloudinary
const cloudinary = require('./controller/config/cloudinary.config.js');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        collectionName: 'sessions',
        ttl: 24 * 60 * 60 // 1 day in seconds
    }),
    cookie: {
        secure: false, 
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24 
    }
}));

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({ storage });

// For CSS and JS files
app.use(express.static(path.join(__dirname, 'public')));

app.engine('hbs', exphbs.engine({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views', 'layouts'),
    partialsDir: path.join(__dirname, 'views', 'partials'),
    helpers: {
        eq: (a, b) => a === b,
        formatDate: (date) => {
            return dayjs(date).tz('Asia/Manila').format('MMM D, YYYY');
        },
        formatTime: (date) => {
            return dayjs(date).tz('Asia/Manila').format('h:mm A');
        }
    }
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use('/', authRoutes);
app.use('/', isAuthenticated, studentRoutes);

connectDB()
    .then(data=> {
        console.log('Database connected successfully');
        
        app.listen(port, () => {
            console.log(`Server is running at http://localhost:${port}`);
        });
}).catch(err => console.error('Database connection failed:', err));
