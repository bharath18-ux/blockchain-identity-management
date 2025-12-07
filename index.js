import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// -------------------------------------------
// LOGIN DATABASE (5 usernames + passwords)
// -------------------------------------------
const loginDB = {
    "Bharath": "99220040454",
    "Ajay": "99220040417",
    "Kabilash": "99220040553",
    "Hari": "99220040059",
    "James": "99220040432"
};

// -------------------------------------------
// LOGIN ROUTE
// -------------------------------------------
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.json({
            success: false,
            message: "Missing username or password"
        });
    }

    if (loginDB[username] && loginDB[username] === password) {
        return res.json({
            success: true,
            message: "Login successful",
            user: username
        });
    }

    return res.json({
        success: false,
        message: "Invalid username or password"
    });
});

// -------------------------------------------
app.listen(7300, () => {
    console.log("Login Backend running at http://localhost:7300");
});
