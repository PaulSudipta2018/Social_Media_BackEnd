const router = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../models/User")


router.put("/:id", async(req, res) => {
    if (req.body.userId === req.params.id || req.body.isAdmin) {
        if (req.body.password) {
            try {
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(req.body.password, salt);

            } catch (err) {
                res.status(500).json(err);
            }
        }
            //user update
        try{
            const user = await User.findByIdAndUpdate(req.params.id, {
                $set: req.body,
            });
            res.status(200).json("User Account updated");
        } catch(err) {
            res.status(500).json(err);
        }
        
    } else {
        res.status(403).json('You can update only your account.')
    }
});

// delete user

router.delete("/:id", async(req, res) => {
    if (req.body.userId === req.params.id || req.body.isAdmin) {
        try {
            const user = await User.findByIdAndDelete(req.params.id);
            res.status(200).json("User deleted successfully");
        } catch (err) {
            res.status(500).json(err);
        }
    } else {
        res.status(403).json("You can delete only your account.")
    }
});

//get a user

router.get("/:id", async(req, res) => {
    console.log("----------------------------")
    try {
        const user = await User.findById(req.params.id);
        const {password, updatedAt, ...other} = user._doc;
        res.status(200).json(other);
    } catch (err) {
        res.status(500).json(err);
    }
});

//follow user
router.put("/:id/follow", async(req, res) => {
    if (req.body.userId !== req.params.id) {
        try {
            //followed
            const user = await User.findById(req.params.id);
            //follower
            const currentUser = await User.findById(req.body.userId);
            if (!user.followers.includes(req.body.userId)) {
                await user.updateOne({$push: {followers: req.body.userId}});
                await currentUser.updateOne({$push: {followings: req.params.id}});
                res.status(200).json("user has been followed");
            } else {
                res.status(403).json("you already follow the user");
            }
        } catch (err) {
            res.status(500).json(err);
        }
    }
});

//unfollow user


module.exports = router;