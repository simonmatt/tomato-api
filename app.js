const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const history = require('connect-history-api-fallback');

const userRoutes = require('./server/api/user')
const videoRoutes = require('./server/api/video')
const commentRoutes = require('./server/api/comment')
const imageRoutes = require('./server/api/image')
const uploadRoutes = require('./server/api/upload')

const jwt_middleware = require('./server/middlewares/jwt')

const API_SECRET = require('./config');

const env = process.env.NODE_ENV || 'development';

let dbUrl = 'mongodb://localhost:27017/vnpastime';

mongoose.connect(dbUrl, { useNewUrlParser: true });
mongoose.Promise = global.Promise;

const app = express();
app.use(cors());
app.set('tokenSecret', API_SECRET);
app.use(bodyParser.json());

app.use('/auth', userRoutes);
app.use(jwt_middleware);
app.use('/api', videoRoutes)
app.use('/api', imageRoutes)
app.use('/api', commentRoutes)
app.use('/api', uploadRoutes)

app.use(history());

app.use((err, req, res, next) => {
    if (err) {
        res.status(442).send({
            error: err
        })
    }
});

const server = app.listen(4002, () => {
    console.log(`Express started in ${env} mode on http://localhost:4002`);
});

/**
 * Socket io for chat online
 */

const socket = require('socket.io');
const io = socket(server);
let onlineUsers = [];

io.on('connect', (socket) => {
    console.log('Access in...');
    socket.on('online', user => {
        if (onlineUsers.length > 0) {
            const onlineUser = onlineUsers.find(ou => ou.name === user.name);
            if (!onlineUser && user.name) {
                onlineUsers.push(onlineUser);
            }
        } else {
            if (user.name) {
                onlineUsers.push(user);
            }
        }
        socket.name = user.name;
        io.sockets.emit('online', onlineUsers);
        socket.broadcast.emit('join', {
            name: user.name,
            type: 'join'
        })
    });

    socket.on('chat', data => {
        io.sockets.emit('chat', data);
    });

    socket.on('disconnect', () => {
        const onlineUser = onlineUsers.find(ou => ou.name === socket.name);
        const index = onlineUsers.indexOf(onlineUser);
        onlineUsers.splice(index, 1);
        io.sockets.emit('online', onlineUser);
        socket.broadcast.emit('user left', {
            name: socket.name,
            type: 'left'
        });
    });
})