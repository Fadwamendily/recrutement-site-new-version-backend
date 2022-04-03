
const userModel = require('../models/userModel')
const jwt = require('jsonwebtoken');
const passport = require('passport');
require('../passportConfig');
require('dotenv').config();
const ValidateRegister = require('../validation/registerValid')
const ValidateLogin = require('../validation/loginValid')
function signToken(userID) {

    return jwt.sign({
        iss: 'moonServer',
        sub: userID
    }, process.env.PRIVATE_KEY, { expiresIn: '1h' }) 

}


module.exports = { 


    register: (req, res) => {
        const { email, password, role } = req.body;
        const { errors, isValid } = ValidateRegister(req.body);
         
        if (!isValid) {
            res.status(404).json(errors);
          } 
        else{  userModel.findOne({ email }, function (err, user) {

              if (err)

                return res.status(500).json({ msg: err.message, error: true })

              if (user)

                return res.status(400).json({ msg: "User already exist", error: true })
              else {
                
                const newUser = new userModel(req.body)
                    
                 newUser.email= req.body.email,
                 newUser.password= req.body.password,
                 newUser.name= req.body.name,
                 newUser.adress= req.body.adress,
                 newUser.phoneNumber= req.body.phoneNumber,
                 newUser.role= req.body.role,
 
                newUser.save((err, user) => {

                    if (err)

                        return res.status(500).json({ msg: err.message, error: true })
                    else {  

                        return res.status(200).json({ isAuthenticated: true, user: { email, role }, error: false })
                    } 
                })}
            }
        )
    }
    },



     login: (req, res) => {
       const {errors, isValid} = ValidateLogin(req.body)
          if (!isValid){
              res.status(404).json({msg: err.message, data: null, errors: true})
          }else{
             const { _id, email, role } = req.user;
             const token = signToken(_id);

            res.cookie("access_token", token, { maxAge: 3600 * 1000, httpOnly: true, sameSite: true });

             return res.status(200).json({ isAuthenticated: true, user: { email, role } })
            }
        },
 

    logout: (req, res) => { 


        res.clearCookie("access_token");
        return res.status(200).json({ success: true, user: { email: "", role: "" } })
    }, 


    getAllUsers: function (req, res) {

        userModel.find({}, (err, users) => {
            if (err) {
                res.json({ message: 'error get all users' + err, data: null, status: 500 })
            }
            else {
                res.json({ message: 'all users in system', size: users.length, data: users, status: 200 })

            }
        })

    },




    getUserById: function (req, res) {

        userModel.findById({ _id: req.params.id })
        
            .exec((err, user) => {
                if (err) {
                    res.json({ message: 'error get one user' + err, data: null, status: 500 })
                }
                else {
                    res.json({ message: ' user in system', data: user, status: 200 })


                }
            })
    },



    getUserbyRole: function (req, res) {

        userModel.find({ role: req.params.role }, (err, User) => {
            if (err) {
                res.json({ message: 'error get one User' + err, data: null, status: 500 })
            } else {
                res.json({ message: 'one User in system', data: User, status: 200 })
            }
        })
    },


    deleteUserById: function (req, res) {

        userModel.findByIdAndDelete({ _id: req.params.id }, (err, User) => {

            if (err) { res.json({ message: 'error delete  one User' + err, data: null, status: 500 }) }
            else { res.json({ message: 'one User delete system', data: User, status: 200 }) }

        })

    },


    uploadavatar: (req, res) => { 

    
        
            //let avatar= req.file.filename;
            const avatar = {
                avatar: req.file.filename,
            };
               console.log('fiiiiiiilllleee', req.file);
               //console.log('params', req.params);
    
            if (req.file.mimetype === 'image/jpeg' || req.file.mimetype === 'image/png') {
                userModel.findByIdAndUpdate({ _id: req.params.id }, avatar, (err, user) => {
                    if (err) {
                        res.status(500).json({ message: "avatar not uploaded" });
                    } else {
                        userModel.findById({ _id: user.id }, (err, user) => {
                            if (err) {
                                res.json("error");
                            } else {
                                res.status(200).json({
                                    message: "user updated",
                                    data: user,
                                });
                            }
                        });
                    }
                }); 
            } 
            else {
                res.json({ msg: 'please enter a valid extention' })
            }

        /*userModel.findByIdAndUpdate({ _id: req.params.id }, avatar,{ new: true }, (err, user) => {
            if (err) {
                res.status(500).json({ message: "avatar not uploaded" });
            } else {
                userModel.findById({ _id: user.id }, (err, user) => {
                    if (err) {
                        res.json("error");
                    } else {
                        if (avatar.mimetype!=='image/jpg') {
                            res.json('please enter a valid extention')
                        }
                        else{
                        res.status(200).json({
                            message: "user updated",
                            data: user,
                        });
                    }
                }});
            }
        });*/
    },
     
}


