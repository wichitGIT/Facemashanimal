import express from "express";
import cors from "cors";
import { router as user } from "./user";
import { router as image } from "./image";
import { router as vote } from "./vote";
import { router as admin } from "./admin";
import { router as upload } from "./upload";
import bodyParser from "body-parser";

//app = web api
export const app = express();

app.use(
    cors({
      origin: "*",
    })
  );
// app.use("/",(req,res) =>{
//     res.send("Hello world!!!")
// });
app.use(bodyParser.text());
app.use(bodyParser.json());
app.use("/user",user );
app.use("/image",image );
app.use("/vote",vote );
app.use("/admin",admin );
app.use("/upload",upload );
app.use("/uploads", express.static("uploads"));
// app.use("/uploads", express.static("uploads"));