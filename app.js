const express = require("express");
const multer = require("multer");
const path = require("path");
const { spawn } = require("child_process");

const app = express();
const port = 3000;
var disease = "adjflk lkasdjflk jasdkjfl aja s";

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static("public"));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.get("/info", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "info.html"));
});
app.get("/result", (req, res) => {
  // choose the last word of the string
  console.log(disease.split("\n"));
  res.render(path.join(__dirname, "views", "result.ejs"), {
    disease: disease.split("\n")[3],
  });
});

app.get("/ad", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "AtopicDermatitis.html"));
});
app.get("/ak", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "ActinicKeratosis.html"));
});
app.get("/bk", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "BenignKeratosis.html"));
});
app.get("/df", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "Dermatofibroma.html"));
});
app.get("/mn", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "MelanocyticNevus.html"));
});
app.get("/mel", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "Melanomaa.html"));
});
app.get("/scc", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "SquamousCellCarcinoma.html"));
});
app.get("/trc", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "TineaRingwormCandidiasis.html"));
});
app.get("/vl", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "Vascularlesion.html"));
});




app.post("/upload", upload.single("photo"), async (req, res) => {
  try {
    // if (!req.file) {
    //   return res.status(400).json({ error: "No file uploaded." });
    // }
 
    console.log("File Uploaded Successfully, No error");

    const process = spawn("python", ["./predict.py"], {
      stdio: ["pipe", "pipe", "pipe"],
    });

    process.stdin.write(req.file.path);
    process.stdin.end();

    let predictedDisease = "";

    process.stdout.on("data", (data) => {
      console.log("Data received from Python script");
      const output = data.toString();
      predictedDisease += output;
      console.log(predictedDisease);
      disease = predictedDisease;
    });

    process.on("exit", async (code) => {
      console.log("Python process exited with code: " + code);

      if (code === 0) {
        // Redirect to the "/result" route after successful processing
        // res.redirect("/result");
        res.render("result", { disease: disease });
      } else {
        // Handle the case where the Python script failed
        res.status(500).json({ error: "Prediction failed." });
      }
    });
  } catch (error) {
    console.error(error);
    // res.status(500).json({ error: "An error occurred." });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
