const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());  // To parse JSON requests
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    console.log("User visited /, serving start.html...");
    res.sendFile(path.join(__dirname, "public", "start.html"));
});

// Handle difficulty selection and send redirect response
app.post("/", (req, res) => {
    const difficulty = req.body.difficulty;
    console.log("Difficulty selected:", difficulty);

    let redirectUrl;
    if (difficulty === "easy") {
        redirectUrl = "/easy.html";
    } else if (difficulty === "medium") {
        redirectUrl = "/medium.html";
    } else if (difficulty === "hard") {
        redirectUrl = "/hard.html";
    } else {
        return res.status(400).json({ error: "Invalid difficulty selected." });
    }

    res.json({ redirectUrl });  // Send response with redirect URL
});

app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}/`);
});
