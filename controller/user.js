const User = require('../model/user')
const Friend = require('../model/friend')
const Post = require('../model/post')
const _ = require('lodash')
const time = () => {
    const data = new Date().toLocaleString('ru-RU')
    const data1 = data.split(',')
    return {data: data1[0], time: data1[1].slice(1, 6)}
}
class UserController {
    async addAsFriends(req, res) {
        try {
            const {fid} = req.body
            const user = await User.findOne({_id: req.user}, 'friends')
            if (!user) return res.send(false)
            const result = _.find(user.friends, (id) => id == fid)
            if (result) return res.send(false)
            const toUser = await User.findOne({_id: fid}, 'friends')
            if (!toUser) return res.send(false)
            const toResult = _.find(toUser.friends, (id) => id == req.user)
            if (toResult) return res.send(false)
            const friend = await Friend.create({
                fid,
                invited: req.user,
                dataAdded: {...time()},
                isFriend: false,
                isInvited: true,
                isRejected: false,
            })
            user.friends.push(friend._id)
            toUser.friends.push(friend._id)
            await user.save()
            await toUser.save()
            return res.send(true)
        } catch (error) {
            console.log('controllers/user/addAsFriends')
            return res.send(false)
        }
    }
    async removeFromFriends(req, res) {
        try {
            const {pid} = req.body
            const user = await User.findOneAndUpdate(
                {_id: req.user, posts: {$in: pid}},
                {$pull: {posts: {$in: pid}}},
                {select: 'posts'}
            )
            if (!user) return res.send(false)
            await Post.findByIdAndRemove(pid)
            return res.send(pid)
        } catch (error) {
            console.log('controllers/profile/deletePost')
            return res.send(false)
        }
    }
    async getFriends(req, res) {
        try {
            const {friends} = await User.findById(req.user, 'friends').populate({
                path: 'friends',
                populate: {path: 'fid', select: 'login nickname onlineStatus avatar'},
            })
            if (!friends) return res.json(false)
            res.json(friends)
        } catch (error) {
            console.log('profile/getUsers')
        }
    }
}

module.exports = new UserController()
