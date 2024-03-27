

import express from "express";
import multer from "multer";
import {  ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "./filebaseconnect";



export const router = express.Router();

class FileMiddleware {
  //Attribute of class
  filename = "";
  //Attribute diskloader for saving file to disk
  public readonly diskLoader = multer({
    // storage = saving file to memory
    storage: multer.memoryStorage(),
    // limit file size
    limits: {
      fileSize: 67108864, // 64 MByte
    },
  });
}

const fileUpload = new FileMiddleware();

router.get("/",(req, res)=>{
  res.send("api upload OK")
})

router.post("/",fileUpload.diskLoader.single("file"),async (req, res) => {
    console.log("File "+req.file);
    try {
      // upload รูปภาพลง firebase โดยใช้ parameter ที่ส่งมาใน URL path
      const url = await firebaseUpload(req.file!);
      res.send(url);
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(555).send("Failed to upload image");
    }
    
  }
);
//deleadimage
router.delete("/deleadimageFirebase",async (req, res) => {
  const path = req.query.path;
  console.log("In delete func:  "+path);
  
  // res.send("Path: "+path)
  await firebaseDelete(String(path));
  res.status(200).send("delete image");
});

async function firebaseUpload(file: Express.Multer.File) {
  // Upload to firebase storage
  const filename = Date.now() + "-" + Math.round(Math.random() * 1000) + ".png";
  // Define locations to be saved on storag
  const storageRef = ref(storage, "/imagesvs/" + filename);
  // define file detail
  const metaData = { contentType: file.mimetype };
  // Start upload
  const snapshost = await uploadBytesResumable(
    storageRef,
    file.buffer,
    metaData
  );
  // Get url image from storage
  const url = await getDownloadURL(snapshost.ref);

  return url;
}

// ลบรูปภาพใน firebase
async function firebaseDelete(path: string) {
  console.log("In firebase Delete:"+path);
  
  const storageRef = ref(
    storage,
    "/imagesvs/" + path.split("/imagesvs/")[1].split("?")[0]
  );
  const snapshost = await deleteObject(storageRef);
}