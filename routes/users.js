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

router.get("/", async(req, res) => {
    console.log("----------------------------")
    const userId = req.query.userId;
    const username = req.query.username;

    try {
        const user = userId ? await User.findById(userId) : await User.findOne({username:username});
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
router.put("/:id/unfollow", async(req, res) => {
    if (req.body.userId !== req.params.id) {
        try {
            console.log("1---------------------");
            const currentUser = await User.findById(req.body.userId);
            const user = await User.findById(req.params.id);
            console.log("2---------------------");
            if (currentUser.followings.includes(req.params.id)) {
                console.log("3---------------------");
                await user.updateOne({$pull : {followers: req.body.userId}});
                await currentUser.updateOne({$pull:{followings: req.params.id}});
                console.log("4---------------------");
                res.status(200).json("user is unfollowed successfully");
            } else {
                console.log("5---------------------");
                res.status(200).json("you dont follow the user");
            }
        } catch (err) {
            res.status(500).json(err);
        }
    } else {
        res.status(403).json("you cant unfollow yourself");
    }
});

//get friends

router.get("/friends/:userId", async(req, res) => {

    try {
        const user = await User.findById(req.params.userId);
        const friends = await Promise.all(
            user.followings.map((friendId) => {
                return User.findById(friendId);
            })
        );
        let friendsList = [];
        friends.map((friend) => {
            const {_id, username, profilePicture} = friend;
            friendsList.push({_id, username, profilePicture});
        });
        res.status(200).json(friendsList);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;