const express = require('express');
const path = require('path');
const superagent = require('superagent').agent();
const cheerio = require('cheerio');

const app = express();
const port = 3005;

const getCSRFToken = async () => {
    try {
        const response = await superagent.get('https://home-access.cfisd.net/HomeAccess/Account/LogOn');
        const $ = cheerio.load(response.text);
        const token = $('input[name="__RequestVerificationToken"]').val();
        return token;
    } catch (error) {
        console.error('Error fetching CSRF token:', error);
        return null;
    }
};

const attemptLogin = async (csrfToken, user, pass) => {
    try {
        const response = await superagent
            .post("https://home-access.cfisd.net/HomeAccess/Account/LogOn?ReturnUrl=/HomeAccess/")
            .send({
                '__RequestVerificationToken': csrfToken,
                'LogOnDetails.Username': user,
                'LogOnDetails.Password': pass,
                'tempPW': pass,
                'Database': "10",
                'VerificationOption': "UsernamePassword"
            })
            .set('Content-Type', 'application/x-www-form-urlencoded');
        
        // Check if login was successful by examining the response (customize based on actual response structure)
        if (response.ok) {  // `ok` is true if status code is 2xx
            return response;
        } else {
            // Handle cases where the response indicates a failure
            throw new Error('Login failed: ' + response.status);
        }
    } catch (error) {
        console.error('Error during login attempt:', error);
        return null; // or you could return a specific error object
    }
};


// Set up the view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.render('login');
});

const dashboardRouter = require('./routes/dashboard');
app.use('/dashboard', dashboardRouter);

// Handle POST request for login
app.post('/LOGIN', async (req, res) => {
    const { uname, pass } = req.body;

    if (!uname || !pass) {
        res.status(400).json({ error: "Username or password is missing!" });
        return;
    }

    try {
        const token = await getCSRFToken();
        if (!token) {
            res.status(500).json({ error: "Failed to fetch CSRF token" });
            return;
        }

        const loginResponse = await attemptLogin(token, uname, pass);

        if (loginResponse && loginResponse.ok) {
            res.redirect('/dashboard');
        } else {
            res.status(401).json({ error: "Invalid credentials or login failed" });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: "An error occurred during login" });
    }
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
