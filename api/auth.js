const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const auth = require('../middleware/auth');
const config = require('config');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator/check'); //to check for errors like email and password lengthi

const User = require('../models/User')



// @route GET api/auth
// @desc Test route
// @access Public

router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.log(err.message);
        res.status(500).send('server error')
    }
});


// @route POST api/auth
// @desc Authenticate user and get token
// @access Public meaning whether we need a token or something

// @guide here the syntax is like (path,[callback,..], callback)
router.post('/',
    [
        check('email', 'Please enter a valid Email Password').isEmail(),
        check('password', 'Password is required').exists()
    ],
    async (req, res) => { //async function runs in a seperate order than rest of the code.
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        const { email, password } = req.body
        try {
            //see if user exists
            let user = await User.findOne({ email });

            if (!user) {
                return res.status(400).json({
                    errors: [
                        { msg: "Invalid Credentials" }
                    ]
                })
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({
                    errors: [{ msg: 'invalid credentials' }]
                })
            }



            const payload = {
                user: {
                    id: user.id
                }
            }

            jwt.sign(
                payload,
                config.get('jwtSecret'), //mysecrettoken defined in config
                { expiresIn: 360000 },
                (err, token) => {
                    if (err) throw err;
                    res.json({ token });
                }
            );

        } catch (err) {
            console.error(err.message);
            res.status(500).send('server error')
        }
    });

module.exports = router