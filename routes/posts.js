const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");

const multer = require("multer");

//cretae a post

router.post("/", async(req, res) => {
    const newPost = new Post(req.body);
    try {
        const savedPost = await newPost.save();
        res.status(201).json(savedPost);
    } catch (err) {
        res.status(500).json(err);
    }
});

//update a post
router.put("/:id", async(req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post.userId === req.body.userId) {
            await post.updateOne({$set: req.body});
            res.status(200).json("post has been updated");
        } else {
            res.status(403).json("you can update only your posts");
        }
    } catch (err) {
        res.status(500).json(err);
    }
});

//Delete a post

router.delete("/:id", async(req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post.userId === req.body.userId) {
            await post.deleteOne();
            res.status(200).json("post has been deleted");
        } else {
            res.status(403).json("you can delete only your posts");
        }
    } catch (err) {
        res.status(500).json(err);
    }
});

//like-dislike a post
router.put("/:id/like", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post.likes.includes(req.body.userId)) {
            await post.updateOne({$push:{likes:req.body.userId}});
            res.status(200).json("Post has been liked");
        } else {
            await post.updateOne({$pull:{likes:req.body.userId}});
            res.status(200).json("Post has been disliked");
        }
    } catch (err) {
        res.status(500).json(err);
    }
})

//get a post
router.get("/:id", async(req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        res.status(200).json(post);
    } catch (err) {
        res.status(500).json(err);
    }
    
});

// get the timeline for the user

router.get("/timeline/:userId", async (req, res) => {
    try {
        //fetch current user details
        const currentUser = await User.findById(req.params.userId);
        console.log("1---------------------");
        //fetch current user posts
        const userPosts = await Post.find({userId : currentUser._id});
        console.log("2---------------------");
        //fetch user frieds posts
        const friendsPost = await Promise.all(
            currentUser.followings.map((friendId) => {
                return Post.find({userId: friendId});
            })
        );
        console.log("3---------------------");
        // merge the current user and friends posts and retun
        res.status(200).json(userPosts.concat(...friendsPost));

    } catch (err) {
        res.status(500).json(err);
    }
    
});


// get the timeline for the user

router.get("/profile/:username", async (req, res) => {
    try {
       const user = await User.findOne({username:req.params.username})
       const posts = await Post.find({userId:user._id});
       res.status(200).json(posts);

    } catch (err) {
        res.status(500).json(err);
    }
    
});

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'public/images');
//     },
//     filename: (req, file, cb) => {
//         console.log(file);
//         cb(null, file.originalname);
//     },
// });
// const upload = multer({storage : storage});

// router.post("/upload", upload.single("file"), (req, res) => {
//     console.log("--------------------------"+req);
//     try {
//         return res.status(200).json("Upload successfully");
//     } catch (err) {
//         console.log(err);
//         return res.status(500).json(err);
//     }
// });


module.exports = router;