const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render("dashboard");
});

router.get('/die', (req, res) => {
    res.sendStatus(500);
});

module.exports = router;
    