const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config()

// middleware
app.use(cors({
  origin: [
    "https://five-steel.surge.sh",
    // "https://library-a576c.firebaseapp.com",
    // "https://library-a576c.web.app",
  ],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ruakr2a.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const bookCollection = client.db('libraryDB').collection('bookCategories');

    const otherBookCollection = client.db('libraryDB').collection('otherCategories');
    const other2BookCollection = client.db('libraryDB').collection('other2Categories');

    const categoryCollection = client.db('libraryDB').collection('categoriesCollect');

    const otherCategoryCollection = client.db('libraryDB').collection('otherCateCollection');

    const borrowCollection = client.db('libraryDB').collection('borrows');

    const logger = async (req, res, next) => {
      console.log('called location --->', req.host, req.originalUrl);
      next()
    }

    // auth api start 
    app.post('/jwt', logger, async (req, res) => {
      try {
        const user = req.body;
        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '24h' });
        res.cookie(
          "token",
          token,
          {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production" ? true: false,
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
          
          
          // secure: true,
          // sameSite:'none'
        }).send({ success: true, token })
      }
      catch (err) {
        console.log(err);
      }
    })

    // verify token 
    const verifyToken = async (req, res, next) => {
      try {
        const token = req.cookies?.token;
        if (!token) {
          return res.status(401).send({ message: 'not authorized access' })
        }
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decode) => {
          if (error) {
            return res.status(401).send({ message: 'unAuthorized access why' })
          }
          req.user = decode;
          next();
        })
      }
      catch (error) {
        console.log(error);
      }
    }


    // get method start 
    app.get('/book-category', logger, async (req, res) => {
      try {
        const result = await bookCollection.find().toArray();
        res.send(result)
      }
      catch (error) {
        console.log(error);
      }
    })
    // other book category 
    app.get('/other-category', logger, async (req, res) => {
      try {
        const result = await otherBookCollection.find().toArray();
        res.send(result)
      }
      catch (error) {
        console.log(error);
      }
    })
    // other 2 book category 
    app.get('/other2-category', logger, async (req, res) => {
      try {
        const result = await other2BookCollection.find().toArray();
        res.send(result)
      }
      catch (error) {
        console.log(error);
      }
    })

    app.get('/category-collection', async (req, res) => {
      try {
        // const queryObj = {}
        // const sortObj = {};
        // const sortField = req.query.sortField;
        // const sortOrder = req.query.sortOrder;
        // if (sortField && sortOrder) {
        //   sortObj[sortField] = sortOrder
        // }
        const filter = req.query;
        console.log(filter);
        const query = {};
        const option = {
          sort : {
            quantity:filter.sort === 'asc' ? 1 : -1
          }
        }


        const result = await categoryCollection.find(query,option).toArray();
        res.send(result)
      }
      catch (err) {
        console.log(err);
      }
    })
    // other category collection 
    app.get('/other-collection', async (req, res) => {
      try {
        const result = await otherCategoryCollection.find().toArray();
        res.send(result)
      }
      catch (err) {
        console.log(err);
      }
    })

    app.get('/borrow-books', logger, verifyToken, async (req, res) => {
      try {
        if (req.query?.email !== req.user?.email) {
          return res.status(403).send({ message: 'unAuthorized access keno' })
        }
        let query = {};
        if (req.query?.email) {
          query = { email: req.query?.email }
        }
        console.log(query);
        const result = await borrowCollection.find(query).toArray();
        res.send(result)
      }
      catch (error) {
        console.log(error);
      }
    })

    app.get('/category-collection/:category', async (req, res) => {
      try {
        const category = req.params.category;
        const query = { category: category };
        const result = await categoryCollection.find(query).toArray();
        res.send(result)
      }
      catch (error) {
        console.log(error);
      }
    })

    app.get('/category-collection/:category/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await categoryCollection.findOne(query);
        res.send(result)
      }
      catch (error) {
        console.log(error);
      }
    })

    // find category other collection by category 
    app.get('/other-collection/:category', async (req, res) => {
      try {
        const category = req.params.category;
        const query = { category: category };
        const result = await otherCategoryCollection.find(query).toArray();
        res.send(result)
      }
      catch (error) {
        console.log(error);
      }
    })


    // find id for other category collection 
    app.get('/other-collection/:category/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await otherCategoryCollection.findOne(query);
        res.send(result)
      }
      catch (error) {
        console.log(error);
      }
    })

    // post method start 
    app.post('/logout', async (req, res) => {
      try {
        const user = req.body;
        res.clearCookie('token', { maxAge: 0, sameSite: 'none', secure: true }).send({ success: true })
      }
      catch (error) {
        console.log(error);
      }
    })

    app.post('/category-collection', async (req, res) => {
      const addData = req.body;
      const result = await categoryCollection.insertOne(addData)
      res.send(result)
    })

    app.post('/book-category', async (req, res) => {
      const addData = req.body;
      const result = await bookCollection.insertOne(addData)
      res.send(result)
    })

    // borrow collection here 
    app.post('/borrow-books', async (req, res) => {
      try {
        const borrowData = req.body;
        const result = await borrowCollection.insertOne(borrowData);
        res.send(result)
      }
      catch (err) {
        console.log(err);
      }
    })


    // put/patch method start 

    app.put('/category-collection/:category/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const updateData = req.body;
        // console.log(updateData);
        const updatedDoc = {
          $set: {
            ...updateData
          }
        }
        const result = await categoryCollection.updateOne(filter, updatedDoc);
        res.send(result)
      }
      catch (err) {
        console.log(err);
      }
    })

    // delete method start 
    app.delete('/borrow-books/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await borrowCollection.deleteOne(query);
        res.send(result)
        console.log(id);
      }
      catch (error) {
        console.log(error);
      }
    })
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send("Library managment CRUD is Running.......")
})

app.listen(port, () => {
  console.log(`Library management System is Running on port : ${port}`);
})