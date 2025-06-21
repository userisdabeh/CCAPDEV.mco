const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');

const app = express();
const port = 3000;

const conn = require('./database')

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

conn()
    .then(data=> {
        console.log('Database connected successfully');
        
        app.listen(port, () => {
            console.log(`Server is running at http://localhost:${port}`);
        });
}).catch(err => console.error('Database connection failed:', err));
