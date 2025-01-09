const axios = require('axios');
const fs = require('fs');
const path = require('path');
const recipes = require('./recipes_raw_nosource_fn'); // Your recipe dataset
const express = require("express");
const { initializeApp } = require("firebase/app");
const { getFirestore, doc, setDoc, getDocs ,collection , updateDoc} = require("firebase/firestore");

const GOOGLE_API_KEY = 'AIzaSyD284odkZHIGGyIv3U-lIsiGcr4_czvYVg';
const SEARCH_ENGINE_ID = '21ef8d54669d84ba8';

const firebaseConfig = {
  apiKey: "AIzaSyB7VKpbcVjSqLQ4IKY1B_-tNmsHMTxxj0Q",
  authDomain: "foodies-29eb3.firebaseapp.com",
  projectId: "foodies-29eb3",
  storageBucket: "foodies-29eb3.firebasestorage.app",
  messagingSenderId: "895242895328",
  appId: "1:895242895328:web:c2a86ee70ee98cb331f585"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);



const fetchImage = async (query) => {
  const apiUrl = `https://www.googleapis.com/customsearch/v1`;
  try {
    const response = await axios.get(apiUrl, {
      params: {
        key: GOOGLE_API_KEY,
        cx: SEARCH_ENGINE_ID,
        q: query,
        searchType: 'image',
        num: 10,
      },
    });
    const imageUrl = response.data.items; // Get the first image link
    return imageUrl || null;
  } catch (error) {
    console.error(`Error fetching image for "${query}":`, error.message);
    return null;
  }
};

const DATA_FILE = path.join(__dirname, 'recipes_raw_nosource_fn.json');

const appp = express();
appp.use(express.json());


appp.get("/index", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html")); // Ensure index.html is in the same directory
});

appp.get("/getfirebase", async (req, res) => {
  try {
    // Reference to the "Recipes" collection
    const recipesCollection = collection(db, "Recipes");

    // Retrieve all documents in the collection
    const querySnapshot = await getDocs(recipesCollection); // Use getDocs instead of getDoc

    const recipes = [];
    querySnapshot.forEach((doc) => {
      // Push each document's data into the recipes array
      recipes.push({ id: doc.id, ...doc.data() });
    });

    // Send the array of documents as a response
    res.status(200).json(recipes);
  } catch (error) {
    console.error("Error getting documents:", error);
    res.status(500).send("Internal Server Error");
  }
});



appp.post("/updateRecipe", async (req, res) => {
  const data = req.body.data;
  console.log(data.id)
  const docRef = doc(db, "Recipes", data.id);
  await updateDoc(docRef, data);

  res.status(200).send("got the data");
});



appp.get("/generateImage", async (req, res) => {
  const title = req.query.title;
  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  try {
    const imageUrl = await fetchImage(title + ' recipe')
    if (imageUrl) {
  
      res.json({ imageUrl });
    } else {
      res.status(404).json({ error: "Image not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});


appp.use(express.static(__dirname)); // Serve static files (like index.html)

appp.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});



