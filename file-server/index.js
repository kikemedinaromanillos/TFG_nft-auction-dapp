// file-server/index.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 4000;

app.use(cors({ origin: "http://localhost:5173" }));

const storage = multer.diskStorage({
  destination: path.join(__dirname, "..", "frontend", "public", "nfts"),
  filename: (req, file, cb) => cb(null, file.originalname)
});

const upload = multer({ storage });

app.post("/upload", upload.array("files"), (req, res) => {
  console.log("📦 Archivos recibidos:", req.files.map(f => f.originalname));
  res.json({ message: "Archivos guardados correctamente." });
});

app.listen(PORT, () => {
  console.log(`🟢 File server corriendo en http://localhost:${PORT}`);
});
