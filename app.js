const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));

mongoose.connect('mongodb://localhost:27017/wikiDB', {useNewUrlParser: true});

const articleSchema = {
    title: String,
    content: String
};

const Article = mongoose.model("Article", articleSchema);

// chaining route handlers
app.route("/articles")
    .get(function(req, res){
    Article.find()
        .then(function(foundArticles){
            res.send(foundArticles)
        })
        .catch(function(err){
            console.log(err);
        });
    })
    .post(bodyParser.urlencoded({extended: true}), function (req, res){
    const newArticle = new Article({
        title: req.body.title,
        content: req.body.content
    });

    newArticle.save()
        .then(() => {
            res.send("Successfully added a new article.");
        })
        .catch((err) => {
            res.send(err);
        });
    })
    .delete(async function(req, res) {
    try {
        await Article.deleteMany();
        res.send("Successfully deleted all articles.");
    } catch (err) {
        res.send(err);
    }
    });


app.route("/articles/:articleTitle")
    .get(async (req, res) => {
        try {
            const foundArticle = await Article.findOne({title: req.params.articleTitle});
            if (foundArticle) {
                res.send(foundArticle);
            } else {
                res.send("No articles matching that title were found.");
            }
        } catch (err) {
            res.send(err);
        }
    })

    .put(bodyParser.urlencoded({extended: true}), async (req, res) => {
        try {
            const updateResult = await Article.findOneAndUpdate(
                {title: req.params.articleTitle},
                {title: req.body.title, content: req.body.content},
                {new: true} // Returns the updated document
            );
            if (updateResult) {
                res.send("Successfully updated article.");
            } else {
                res.send("No articles matching that title were found.");
            }
        } catch (err) {
            res.send(err);
        }
    })

    .patch(async (req, res) => {
        const updateResult = await Article.updateOne(
            { title: req.params.articleTitle },
            { $set: req.body }
        );
        if (updateResult.nModified !== 0) {
            res.send("Successfully updated article.");
        } else {
            res.send("No articles matching that title were found.");
        }
    })

    .delete(async (req, res) => {
        try {
            const deleteResult = await Article.deleteOne({ title: req.params.articleTitle });
            if (deleteResult.deletedCount !== 0) {
                res.send("Successfully deleted the corresponding article.");
            } else {
                res.send("No articles matching that title were found.");
            }
        } catch (err) {
            res.send(err);
        }
    });


app.get("/articles", );

app.post("/articles", );

app.delete("/articles", );

app.listen(3000, function() {
    console.log("Server started on port 3000");
});