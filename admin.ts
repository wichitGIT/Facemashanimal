import express from "express";
import mysql from "mysql";

export const router = express.Router();
export const conn = mysql.createPool({
    connectionLimit: 10,
    host: "202.28.34.197",
    user: "web65_64011212157",
    password: "64011212157@csmsu",
    database: "web65_64011212157",
  });


  //ค้น all today
  router.get("/time", (req, res) => {
    // let id = +req.params.id;
    
    conn.query("SELECT `Time` FROM `admin`" , (err, result) => {
    if (err) throw err;
      res.json({time:result[0].Time});
    });
  });

    //update time
    router.put("/retime/:time", (req, res) => {
        let time = +req.params.time;
        let sql = mysql.format("UPDATE `admin` SET `Time`=?", [time]);
        conn.query(sql, (err, result) => {
        if (err) throw err;
          res.json({RetimeTo:time});
        });
      });