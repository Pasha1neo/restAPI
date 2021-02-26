const {Router} = require('express')
const router = Router()
const UserSchema = require('./user')

router.post('/signup', async (req, res) => {
    console.log(req.body)
    const response = await UserSchema.create(req.body)
    res.status(200).send({resultCode: 0})
})

router.post('/signin', async (req, res) => {
    const data = await UserSchema.find({login: req.body.login}, {_id: 0})
    const valid = req.body.password === data[0].password ? true : false
    if (valid) {
        res.status(200).send({resultCode: 0})
    } else {
        res.status(200).send({resultCode: 1, error: 'неправильный пароль'})
    }
})
module.exports = router
