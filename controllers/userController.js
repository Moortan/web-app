const User = require('../models/userModel');
const Team = require('../models/teamModel')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('../config')(process.env.NODE_ENV);
const { roles } = require('../config/roles');
const cookieParser = require('cookie-parser');

 
async function hashPassword(password) {
 return await bcrypt.hash(password, 10);
}
 
async function validatePassword(plainPassword, hashedPassword) {
 return await bcrypt.compare(plainPassword, hashedPassword);
}
 
exports.signup = async (req, res, next) => {
    try {
        let newUser;
        const { email, username, password, role } = req.body;

        User.findOne({email: email}, async (err, user) => {
            if(user) return res.status(400).json({ auth : false, message :"email already exits"});

            User.findOne({username: username}, async (err, user) => {
                if(user) return res.status(400).json({ auth : false, message :"username already exits"});

                const hashedPassword = await hashPassword(password);
                newUser = new User({ email, username, password: hashedPassword, role: role || "basic" });
                const accessToken = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
                    expiresIn: "1d"
                });

                newUser.accessToken = accessToken;

                await newUser.save();
                res.json({
                    data: newUser,
                    accessToken
                });
            });
        });
    }   catch (error) {
            next(error);
            };
}

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !await validatePassword(password, user.password)) return next(new Error('Wrong email or password'));
        //const validPassword = await validatePassword(password, user.password);

        //if (!validPassword) return next(new Error('Password is not correct'))
        const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1d"
        });

        await User.findByIdAndUpdate(user._id, { accessToken })
        let options = {
            httpOnly: true
        };
        res.cookie('x-access-token', accessToken, options);
        res.status(200).json({
            data: { email: user.email, role: user.role },
            accessToken
        })
        } catch (error) {
            next(error);
    }
}

exports.logout = async(req, res, next) => {
    try {        
        let options = {
            httpOnly: true
        }
        res.clearCookie('x-access-token', options);
        res.sendStatus(200);

    } catch (error) {
        next (error);
    }

}; 

exports.getTeams = async (req, res, next) => {
    const teams = await Team.find({});
    res.status(200).json({
        data: teams
    });
}
    
exports.getTeam = async (req, res, next) => {
    try {
        const teamId = req.params.teamId;
        const team = await Team.findById(teamId);
        if (!team) return next(new Error('Team does not exist'));
            res.status(200).json({
            data: team
        });
    } catch (error) {
        next(error)
    }   
}
    
exports.updateTeam = async (req, res, next) => {
    try {
        const update = req.body
        const teamId = req.params.teamId;
        await Team.findByIdAndUpdate(teamId, update);
        const team = await Team.findById(teamId)
        res.status(200).json({
            data: team,
            message: 'Team has been updated'
        });
    } catch (error) {
        next(error)
    }
}
    
exports.deleteTeam = async (req, res, next) => {
    try {
        const teamId = req.params.teamId;
        await Team.findByIdAndDelete(teamId);
        res.status(200).json({
            data: null,
            message: 'Team has been deleted'
        });
    } catch (error) {
        next(error)
    }
}

exports.addTeam = async (req, res, next) => {
    
    try {
        const newTeam = new Team(req.body);

        await Team.findOne({'teamName':req.body.teamName}, async(err, team) => {
            if(team) return res.status(400).json({message: `${req.body.teamName} is already taken team name`});
    
            await Team.findOne({'teamTag':req.body.teamTag}, (err, team) => {
                if(team) return res.status(400).json({message: `${req.body.teamTag} is already taken team tag`});
    
                newTeam.save((err,doc)=>{
                    if(err) {console.log(err);
                    return res.status(400).json({ success : false});}
                    res.status(200).json({
                        succes: true,
                        team : doc
                    });
                });
            });
        })
    } catch(error) {
        next(error);
    }

};

exports.grantAccess = function(action, resource) {
    return async (req, res, next) => {
        try {
            const permission = roles.can(req.user.role)[action](resource);
            if (!permission.granted) {
                return res.status(401).json({
                    error: "You don't have enough permission to perform this action"
                });
            }
            next()
        } catch (error) {
                next(error)
            }
    }
}
   
exports.allowIfLoggedin = async (req, res, next) => {
    try {
        const user = res.locals.loggedInUser;
        if (!user)
            return res.status(401).json({
                error: "You need to be logged in to access this route"
            });
            req.user = user;
            next();
        } catch (error) {
            next(error);
        }
}
