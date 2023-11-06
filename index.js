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
    "http://localhost:5173"
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
    const categoryCollection = client.db('libraryDB').collection('categoriesCollect');
    const borrowCollection = client.db('libraryDB').collection('borrowBook');


    // auth api start 
    app.post('/jwt', async (req, res) => {
      try {
        const user = req.body;
        const token = jwt.sign(user,'token', { expiresIn:'24h'});
        console.log(token);
        res.cookie('token', token, {
          httpOnly:true,
          secure:true,
          // sameSite:'none'
        }).send({success:true, token})
      }
      catch (err) {
        console.log(err);
      }
    })



app.post('/logout', async(req,res) => {
  try{
    const user = req.body;
    res.clearCookie('token', {maxAge:0, sameSite: 'none', secure:true}).send({success:true})
  }
  catch(error){
    console.log(error);
  }
})





    // get method start 
    app.get('/book-category', async (req, res) => {
      try {
        const result = await bookCollection.find().toArray();
        res.send(result)
      }
      catch (error) {
        console.log(error);
      }
    })

    app.get('/category-collection', async (req, res) => {
      try {
        const result = await categoryCollection.find().toArray();
        res.send(result)
      }
      catch (err) {
        console.log(err);
      }
    })

    app.get('/borrow-books', async (req, res) => {
      try {
        const result = await borrowCollection.find().toArray();
        res.send(result)
      }
      catch (error) {
        console.log(error);
      }
    })

    // app.get('/category-collection/:id', async (req, res) => {
    //   try {
    //     const id = req.params.id;
    //     const query = { _id: new ObjectId(id) };
    //     console.log('query id ',query);
    //     const result = await categoryCollection.findOne(query)
    //     res.send(result)
    //   }
    //   catch (error) {
    //     console.log(error);
    //   }
    // })


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

    // post method start 
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