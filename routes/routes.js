const express = require('express');
const router = express.Router();
const USERS = require("../models/users");
const shortid = require('shortid');
const MongoClient = require('mongodb').MongoClient;
const PASS = process.env.PASS
const API_KEY = `mongodb+srv://KazztheCajun:${PASS}@cajuncluster.7z3ar.mongodb.net/PetFoodApp?retryWrites=true&w=majority`;
const mongo = new MongoClient(API_KEY,{ useNewUrlParser: true, useUnifiedTopology: true });
const passport = require('../middlewares/passport-config');

mongo.connect( async (err) => // all calls to the mongo database have to be made withing the connect block
{
    if (err)
    {
        return console.error(err);
    }
    console.log("[Server] Connected to Pet Food App Database successfully.");

    const savedHomes = mongo.db("PetFoodApp").collection("Homes"); // save the homes database connection for later use
    const savedUsers = mongo.db("PetFoodApp").collection("Users"); // save the users database connection for later use

    console.log("[Server] Loading saved users");
    
    //Server Setup
    async function updateServer() // check the database for current list of tracked users
    {
        let saved = await savedUsers.find({}).toArray();
        //console.log(saved);
        USERS.setUsers(saved);
        //console.log(USERS.users);
    }
    updateServer();
    
    // Requests the home with the given ID from the server
    // Returns all the data associated with that home
    router.get("/home/:id", async(request, response) =>
    {
        // frontend will send home ID in request parameters
        const id = request.params.id;
    //    console.log(id);
        const data = await mongo.db("PetFoodApp").collection("Homes").findOne({_id: id});
    //    console.log(data);
        if (typeof data != 'undefined')
        {
            response.json(data);
        }
        else
        {
            response.json({"success": false, "message": "No Home with that ID exists."});
        }
    });
    
    // Creates a new home from the given name and stores it in the server
    // Returns the created home for frontend use
    router.post("/new", async(request, response) =>
    {
        // frontend will send new home name in query
        const {name} = request.query;
        // console.log(name);
        const home = {home: name, _id: shortid.generate(), pets: [], log: []};
        const res = await savedHomes.insertOne(home);
        // console.log(res);
        const date = new Date(Date.now());
        console.log(`[Server] ${name} created at ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`);
        updateServer();
        response.json({"success": true, "message": "A home was found", "home": home});
    });
    
    // gets the list of homes currently saved in the database
    router.post("/list/homes", async(request, response) =>
    {
        const homes = request.body; // Get the names of the homes a user has access too
    //    console.log(homes);
        let homeList = await savedHomes.find({_id: {$in: homes}}).project({pets:0, log:0}).toArray(); // load those homes from the database
    //    console.log(homeList);
        response.json({"success": true, "message": "The list of homes the user has access to", "homes": homeList});
    });

    // updates the current home's data in the database
    router.post("/update/home", async(request, response) =>
    {
        const home = request.body; // get the home data from the request body
        //console.log(home);
        let r = await savedHomes.updateOne({_id: home._id}, {$set: {home: home.home, pets: home.pets, log: home.log}}); // update the home data in the database
        updateServer(); // update the server to reflect any potential changes
        response.json({"success": true, "message": "Home was updated succesfully", "update": r});
    });

    // updates the current users info in the database
    router.post("/update/user", async(request, response) =>
    {
        console.log("updating:");
        const user = request.body; // get user info from request body
        console.log(user);
        let r = await savedUsers.updateOne({_id: user._id}, {$set: {homes: user.homes}}); // store the info in the database
        updateServer(); // update the server to reflect any potential changes
        response.json({"success": true, "message": "User was updated succesfully", "update": r});
    });

    router.post("/login", async(request, response, next) =>
    {
        console.log("login request recieved");
    //  console.log(request.body);
        const config = {};
        const handler = passport.authenticate('local');
        handler(request, response, (req, res) =>
        {
        //    console.log(request.user);
            response.json({"user": request.user, "success": true, "message": "User has logged in!"});
        });
    });

    router.post("/signup", async(request, response) =>
    {
        const {name, pass, homes} = request.body;
        let u = await USERS.add(name, pass, homes);
        savedUsers.insertOne(u);
        response.json({"success": true, "message": `${name} was sucessfully created`});
    });

    router.get("/user/:id", async(request, response) =>
    {
        const id = request.params.id;
        let u = await savedUsers.findOne({_id: id}, {password: 0});
    //    console.log(u);
        let json = response.json({"user": u, "success": true, "message": "User was found!"});
        return json;
    });
    
});




module.exports = router;