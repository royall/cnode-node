const topics = require('./module/topics');
const topic = require('./module/topic');
const user = require('./module/user');

module.exports = {
    '/': topics,
    '/topics': topics,
    '/topic/:id': topic,
    '/user/:id': user
};