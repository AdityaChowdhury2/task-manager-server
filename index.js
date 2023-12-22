const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send("Hello World!");
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tygff9b.mongodb.net/?retryWrites=true&w=majority`;
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

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
        app.listen(port, () => {
            console.log(`listening on ${port}`);
        })

    } finally {
        // Ensures that the client will close when you finish/error

    }
}
run().catch(console.dir);

const userCollection = client.db(process.env.DB_NAME).collection('users');
const taskCollection = client.db(process.env.DB_NAME).collection('tasks');

app.put('/api/v1/users/:email', async (req, res) => {
    try {
        const email = req.query.email;
        const updatedUser = {
            $set: {
                ...req.body
            }
        }
        const filter = { email };
        const result = await userCollection.updateOne(filter, updatedUser, { upsert: true });
        res.send(result);
    } catch (error) {
        res.send(500).json({ message: 'Server error' })
    }
})

app.post('/api/v1/tasks', async (req, res) => {
    try {
        const task = req.body;
        const result = await taskCollection.insertOne(task)
        res.send(result);
    } catch (error) {
        res.send(500).json({ message: 'Server error' })
    }
})

app.get('/api/v1/tasks/:email', async (req, res) => {
    try {
        const filter = { email: req.params.email }
        const result = await taskCollection.find(filter).toArray();
        res.send(result);
    } catch (error) {
        res.send(500).json({ message: 'Server error' })
    }
})

app.patch('/api/v1/tasks/:taskId', async (req, res) => {
    try {
        const id = req.params.taskId;
        const filter = {
            _id: new ObjectId(id)
        };
        const updatedDoc = {
            $set: {
                ...req.body
            }
        }
        console.log(id);
        console.log(updatedDoc);
        const result = await taskCollection.updateOne(filter, updatedDoc)
        console.log(result);
        res.json(result);
    } catch (error) {
        res.send(500).json({ message: 'Server error' })
    }
})

app.delete('/api/v1/tasks/:taskId', async (req, res) => {
    try {
        const id = req.params.taskId;
        const filter = {
            _id: new ObjectId(id)
        };
        const result = await taskCollection.deleteOne(filter);
        res.json(result);
    } catch (error) {
        res.send(500).json({ message: 'Server error' })
    }
})