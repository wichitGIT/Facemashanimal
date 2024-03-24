// import express from "express";
const express = require('express');
// import cors from "cors";
const cors = require('cors');
import { router as user } from "./user.ts";
import { router as image } from "./image.ts";
import { router as vote } from "./vote.ts";
import { router as admin } from "./admin.ts";
import bodyParser from "body-parser";

//app = web api
export const app = express();

app.use(
    cors({
      origin: "*",
    })
  );
// app.use("/",(req:any, res:any) =>{
//     res.send("Hello world!!!")
// });
app.use(bodyParser.text());
app.use(bodyParser.json());
app.use("/user",user );
app.use("/image",image );
app.use("/vote",vote );
app.use("/admin",admin );
// app.use("/uploads", express.static("uploads"));
