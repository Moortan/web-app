// server/routes/route.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');


router.post('/signup', userController.signup);

router.post('/login', userController.login);

router.get('/logout', userController.allowIfLoggedin, userController.logout);

router.get('/team/:teamId', userController.allowIfLoggedin, userController.getTeam);

router.post('/team', userController.allowIfLoggedin, userController.addTeam);

router.get('/teams', userController.allowIfLoggedin, userController.grantAccess('readAny', 'profile'), userController.getTeams);

router.put('/teams/:teamId', userController.allowIfLoggedin, userController.grantAccess('updateAny', 'profile'), userController.updateTeam);

router.delete('/team/:teamId', userController.allowIfLoggedin, userController.grantAccess('deleteAny', 'profile'), userController.deleteTeam);

module.exports = router;