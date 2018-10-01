const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Video = require('../models/video');

router.get('/videos', (req, res, next) => {
    const page = req.query.p || 1;
    const limitNum = 15;
    Video.find({}).count().then(count => {
        let total = count;
        Video.find({}).sort({ created_at: -1 }).skip((page - 1) * limitNum).limit(limitNum)
            .then(videos => {
                let tasks = [];
                videos.forEach(video => {
                    const name = video.user.name;
                    let task = User.findOne({ name: name });
                    tasks.push(task);
                })

                Promise.all(tasks).then(users => {
                    videos.forEach(video => {
                        users.forEach(user => {
                            if (video.user.name === user.name) {
                                video.user = {
                                    name: user.name,
                                    avatar: user.avatar_url,
                                    _id: user._id
                                }
                            }
                        })
                    });

                    res.send({
                        total,
                        videos
                    });
                });

            })
    }).catch(next);
});

router.get('/uservideos', (req, res, next) => {
    const userId = req.query.userId;

    let userVideos = [];
    User.findOne({ _id: userId }).then(user => {
        Video.find({}).sort({ created_at: -1 }).then(videos => {
            videos.forEach(video => {
                if (video.user.name === user.name) {
                    userVideos.push(video);
                }
            });
        }).then(() => {
            res.json({
                userVideos
            })
        })
    }).catch(next);
})

router.get('/videos/:id', (req, res, next) => {
    const id = req.params.id;
    Video.findById({ _id: id }).then(video => {
        res.send(video);
    }).catch(next);

});

router.post('/videos', (req, res, next) => {
    const videoInfo = {
        user: {
            name: req.decoded.name,
            avatar: req.decoded.avatar
        },
        playUrl: req.body.playUrl,
        coverSrc: req.body.coverSrc,
        title: req.body.title
    };

    Video.create(videoInfo).then(video => {
        res.json({
            success: true,
            message: 'Added video successfully',
            video: video
        })
    }).catch(err => {
        res.json({
            success: false,
            err: err
        });
        next();
    });
});

router.delete('/videos/:id', (req, res, next) => {
    const id = req.params.id;
    Video.findByIdAndRemove({ _id: id }).then(video => {
        res.json({
            success: true,
            message: 'Delete video successfully'
        });
    }).catch(err => {
        res.json({
            success: false,
            err: err
        });
        next();
    });
});

module.exports = router;