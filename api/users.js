const express = require('express');
const router = express.Router();
const gravatar = require('gravatar')
const bcrypt = require('bcryptjs')
const config = require('config')
const jwt = require('jsonwebtoken')
const {check, validationResult} = require('express-validator/check') //to check for errors like email and password lengthi

const User = require('../models/User')
// @route POST api/users
// @desc Register user
// @access Public meaning whether we need a token or something

// @guide here the syntax is like (path,[callback,..], callback)
router.post('/',
[
    check('name', 'name is required').not().isEmpty(),
    check('email','please enter a valid email').isEmail(),
    check('password','please enter a password with min 6 characters').isLength({min: 6 })
],
async (req, res)=> { //async function runs in a seperate order than rest of the code.
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }

    const {name, email, password} = req.body
    try{
        //see if user exists
        let user = await User.findOne({email});

        if (user){
            return res.status(400).json({
                errors:[
                    {msg: "User Already Exists"}
                ]
            })
        }
        

        //get user gravatar
        const avatar = gravatar.url(email ,{
            s: '200', r: 'pg', d: 'mm' // s is size, pg for naked stuff.
        })

        user = new User({
            name,
            email,
            avatar,
            password
        })

        //Encrypt the password
        const salt = await bcrypt.genSalt(10); //10 is the number of rounds for hashing recommended by documentatino.
        
        user.password = await bcrypt.hash(password, salt);// if we don't use await , we have to do it like ...then(callback) but
        //using this style is much prettier

        await user.save();

        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(
            payload,
            config.get('jwtSecret'), //mysecrettoken defined in config
            {expiresIn: 360000},
            (err, token) => {
                if (err) throw err;
                res.json({token});
            }
        );

    } catch(err){
        console.error(err.message);
        res.status(500).send('server error')
    }
});

module.exports = router