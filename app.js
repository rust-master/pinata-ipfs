const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000; // Set your desired port number

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import the pinFileToIPFS function from your module
const { pinFileToIPFS } = require("./pinata");

// Define a route to handle file uploads and pinning to IPFS
app.post("/upload", async (req, res) => {
  try {
    // Retrieve file and data from the request
    const { filePath, data } = req.body;

    console.log("filePath:", filePath);
    console.log("Data:", data);

    // Call the pinFileToIPFS function from your module
    const result = await pinFileToIPFS(filePath, data);

    if (result) {
      res.status(200).json({ success: true, result });
    } else {
      res
        .status(500)
        .json({
          success: false,
          message: "Failed to upload and pin the file.",
        });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
