var express = require('express');
var router = express.Router();
var insertStatus = require('../modules/insertStatus');

/* GET home page. */
router.post('/', async function(req, res, next) {
    insertStatus(req)
    .then((response) => {
        console.log(response);
        res.send(response);
    })
    .catch ((response) => {
        res.send(response);
    })
});

module.exports = router;
