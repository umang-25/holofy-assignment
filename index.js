require('dotenv').config();
const express = require('express');
const { connect } = require('./utils/dbConnect');
const { Books } = require('./models/book');
const { User } = require('./models/user')
const jwt = require('jsonwebtoken');
const auth = require('./middleware/auth.js');
connect();
const app = express();
const port = 3000;
app.use(express.json());

// POST
app.post('/books', [auth], async (req, res) => {
    // check for token expiration
    const now = Date.now()
    if (req.user.exp < now) return res.status(403).send('The User Token has expired')
    const { uuid, name, releaseDate, authorName } = req.body;
    if (!uuid) return res.status(500).send('Require uuid for saving books');
    const dateval = new Date(releaseDate);
    const book = new Books({
        uuid: uuid,
        name: name,
        releaseDate: dateval.valueOf(),
        authorName: authorName
    });
    book.save(function (err, result) {
        if (err) {
            console.log(err)
            return res.status(500).send('Unable to save document');
        }
        return res.status(200).send('Book has been saved successfully');
    });

});

//PATCH
app.patch('/books/:bookUuid', [auth], async (req, res) => {
    // check for token expiration
    const now = Date.now()
    if (req.user.exp < now) return res.status(403).send('The User Token has expired')

    const { name, releaseDate, authorName } = req.body;
    const uuid = req.params.bookUuid;

    const dateval = releaseDate ? new Date(releaseDate) : null;
    const query = {}
    if (name) query.name = name;
    if (releaseDate) query.releaseDate = dateval.valueOf();
    if (authorName) query.authorName = authorName;

    const updateQuery = await Books.updateOne(
        { uuid: uuid }, { $set: query }
    );
    if (updateQuery.modifiedCount === 0) return res.status(200).send('No books were updated, book might not exist');
    return res.status(200).send('Updated data for book Successfully !');
});

//GET paginated
app.get('/books', [auth], async (req, res) => {
    // check for token expiration
    const now = Date.now()
    if (req.user.exp < now) return res.status(403).send('The User Token has expired')
    const { page } = req.query;
    const pageNumber = page - 1;
    const pageLimit = 10;
    const books = await Books.find().skip(pageNumber * pageLimit).limit(pageLimit);
    if (books.length === 0) return res.status(200).send('There are no books in the database');
    return res.status(200).send({ books });
});

//GET book by id
app.get('/books/:bookUuid', [auth], async (req, res) => {
    // check for token expiration
    const now = Date.now()
    if (req.user.exp < now) return res.status(403).send('The User Token has expired')
    const uuid = req.params.bookUuid;
    const book = await Books.findOne({ uuid: uuid });
    if (!book) return res.status(500).send('Book not found');
    return res.status(200).send({ book });
});

// DELETE book by uuid
app.delete('/books/:bookUuid', [auth], async (req, res) => {
    // check for token expiration
    const now = Date.now()
    if (req.user.exp < now) return res.status(403).send('The User Token has expired')
    const uuid = req.params.bookUuid;
    const deleted = await Books.deleteOne({ uuid: uuid });
    if (deleted.deletedCount === 0) return res.status(200).send('Cannot delete the document, it might not exist');
    return res.status(200).send('Deleted document');
});

// Delete All
app.delete('/books', [auth], async (req, res) => {
    // check for token expiration
    const now = Date.now()
    if (req.user.exp < now) return res.status(403).send('The User Token has expired')
    if (!req.user.isAdmin) return res.status(403).send('The User in not authorised, Only admins can delete all')
    const deleteAll = await Books.collection.drop();
    return res.status(200).send('Deleted all documents');
})

// register User
app.post('/user', async (req, res) => {
    const { phone, isAdmin } = req.body
    const oldUser = await User.findOne({ phone: phone });
    if (oldUser) return res.status(401).send('User already exist');
    const user = await User.create({
        phone: phone,
        isAdmin: isAdmin === 1,
    });

    // Token
    const token = jwt.sign(
        { phone: user.phone, isAdmin: user.isAdmin },
        process.env.TOKEN_KEY,
        {
            expiresIn: "2h",
        }
    );
    user.token = token;
    return res.status(201).json(user);
})

// get token
app.get('/token', async (req, res) => {
    const { phone } = req.query;
    const user = await User.findOne({ phone: phone });
    if (user) return res.status(200).json(user.token);
    else return res.status(502).send(`User doesn't exist`);
})

//update token
app.put('/token/:phone', async (req, res) => {
    const { phone } = req.params;
    const user = await User.findOne({ phone: phone });
    if (!user) return res.status(502).send('User does not exist');
    const token = jwt.sign(
        { phone: user.phone, isAdmin: user.isAdmin },
        process.env.TOKEN_KEY,
        {
            expiresIn: "2h",
        }
    );
    const updated = await User.updateOne({ phone: phone }, { $set: { token: token } });
    return res.status(200).json({ token: token });
})






app.listen(port, () => {
    return console.log(`Server is listening on port: ${port}`);
});

module.exports = { app };