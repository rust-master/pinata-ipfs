const formData = require("form-data");
const fs = require("fs");
const axios = require("axios");
require("dotenv").config();
const {
  PINATA_API_KEY,
  PINATA_SECRET_API_KEY,
  PINATA_PINNING_URL,
  PINATA_FILE_ACCESS_URL,
} = process.env;

const uploadFileToIpfs = async (formData) => {
  try {
    const url = `${PINATA_PINNING_URL}/pinFileToIPFS`;
    const response = await axios.post(url, formData, {
      headers: {
        "Content-Type": `multipart/form-data; boundary= ${formData._boundary}`,
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_API_KEY,
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });
    return response;
  } catch (err) {
    console.log(err, "error while file to ipfs");
  }
};
const handleJsons = async (fileUrl, nftInfo) => {
  const url = `${PINATA_PINNING_URL}/pinJSONToIPFS`;
  let { name, external_link, description } = nftInfo;

  const data = {
    name,
    ...(external_link && { external_link }),
    ...(description && { description }),
    image: fileUrl,
  };

  try {
    const response = await axios.post(url, data, {
      headers: {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_API_KEY,
      },
    });
    const dataInput = {
      ipfsJsonData: data,
      metaDataUrl: `${PINATA_FILE_ACCESS_URL}/${response.data.IpfsHash}`,
      fileUrl,
    };

    return { dataInput, image: fileUrl };
  } catch (err) {
    console.log(err, "Error while json ");
  }
};

const pinFileToIPFS = async (filePath, data) => {
  try {
    const originalFile = new formData();

    let fileUrl = null;

    if (filePath) {
      originalFile.append("file", fs.createReadStream(`${filePath}`));
      const orignalIpfsFile = await uploadFileToIpfs(originalFile);
      console.log({ originalFile, orignalIpfsFile }, "orignalFile");
      fileUrl = `${PINATA_FILE_ACCESS_URL}/${orignalIpfsFile?.data.IpfsHash}`;
      console.log(fileUrl, "fileUrl=>");
      await deleteFileFromDirectory(filePath);
    }

    if (fileUrl) {
      let metaData = await handleJsons(fileUrl, { ...data });
      console.log(metaData, "metaData=>");
      return metaData;
    }
    return false;
  } catch (err) {
    console.log(err, "error while file");
  }
};

const deleteFileFromDirectory = (path) => {
  return new Promise((resolve, reject) => {
    fs.unlink(`${path}`, async (err) => {
      if (err) {
        reject({ success: false, err });
      }
      resolve({ success: true });
    });
  });
};

module.exports = {
  pinFileToIPFS,
};
