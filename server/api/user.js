const express = require('express');
const router = express.Router();

const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const API_SECRET = require('../../config')

router.get('/users', (req, res, next) => {
    User.find({}).then(users => {
        res.send(users);
    }).catch(next);
});

router.get('/users/:id', (req, res, next) => {
    const id = req.params.id;
    User.findById({ _id: id }).then(user => {
        res.send(user);
    }).catch(next);
});


router.get('/user', (req, res, next) => {
    const token = req.headers.accesstoken;
    const decoded = jwt.verify(token, API_SECRET);
    const name = decoded.name;
    User.findOne({ name: name }).then(user => {
        res.send(user);
    }).catch(next);
})

router.post('/users', (req, res, next) => {
    const { username, password, type } = req.body;
    if (type === 'signin') {
        User.findOne({ name: username })
            .then(user => {
                if (user != null) {
                    if (!bcrypt.compareSync(password, user.password)) {
                        res.json({
                            success: false,
                            message: 'Unauthorized, incorrect password'
                        });
                    } else {
                        const payload = {
                            name: user.name,
                            id: user._id
                        };

                        const token = jwt.sign(payload, API_SECRET);
                        res.json({
                            success: true,
                            message: 'Signed in successfully',
                            token: token
                        });
                    }
                } else {
                    res.json({
                        success: false,
                        message: 'username is in use'
                    })
                }
            }).catch(next);
    } else {
        User.findOne({ name: username }).count().then(count => {
            if (count > 0) {
                res.json({
                    success: false,
                    message: 'User not found'
                });
            } else {
                const salt = bcrypt.genSaltSync(10);
                const hash = bcrypt.hashSync(password, salt);

                const userInfo = {
                    name: username,
                    password: hash,
                    avatar_url: 'http://i1.fuimg.com/605011/1f0138a7b101b0f1.jpg'
                };

                User.create(userInfo).then(user => {
                    const payload = {
                        name: user.name,
                        id: user._id
                    };

                    const token = jwt.sign(payload, API_SECRET);
                    res.json({
                        success: true,
                        message: 'Signed up successfully',
                        token: token
                    });
                });
            }
        }).catch(next);
    }
});

router.put('/users/:id', (req, res, next) => {
    const id = req.params.id;
    User.findByIdAndUpdate({ _id: id }, req.body).then(user => {
        User.findById({ _id: id }).then(newUser => {
            res.send(newUser);
        });
    }).catch(next);
});

router.delete('/users/:id', (req, res, next) => {
    const id = req.params.id;
    User.findByIdAndRemove({ _id: id }).then(user => {
        res.send(user);
    }).catch(next);
});

module.exports = router;