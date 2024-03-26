import express from "express";
import mysql from "mysql";
import { imagemodel } from "./model/image";
import util from "util"
import * as cron from 'node-cron';

export const router = express.Router();
export const conn = mysql.createPool({
    connectionLimit: 10,
    host: "202.28.34.197",
    user: "web65_64011212157",
    password: "64011212157@csmsu",
    database: "web65_64011212157",
  });

  

cron.schedule('0 0 * * *', () => {
  console.log("hello");
  const queryAsync=util.promisify(conn.query).bind(conn);

    conn.query("SELECT Iid FROM Image AS t1 WHERE DATE(`Time`) = CURDATE() - INTERVAL 1 DAY ORDER BY `Score` DESC;" , async (err, allimage) => {
      if (!err || allimage.length>0 ){
      allimage.forEach(async (Lidimg: any) => {
        console.log(Lidimg.Iid);

    let sql = mysql.format("select * from `Image` where Iid = ?", [Lidimg.Iid]);
  
    let result = await queryAsync(sql);
    let imageData = JSON.parse(JSON.stringify(result));
    imageData = imageData[0] as imagemodel
    console.log(imageData);
    
    const datenow =new Date();
    const timestamp = Date.parse(imageData.Time);
    const dateold = new Date(timestamp);
    // console.log(datenow);
    console.log("now"+datenow.getDate());
    console.log("old"+dateold.getDate());
    // console.log(dateold);
    // console.log(imageData);
    const isSameDate = (dateold: Date, datenow: Date) => {
      return dateold.getDate() < datenow.getDate() &&
            dateold.getMonth() <= datenow.getMonth() &&
            dateold.getFullYear() <= datenow.getFullYear();

  }
  console.log(isSameDate(dateold,datenow))
    if (isSameDate(dateold,datenow)){
        sql ="UPDATE `Image` SET `Time`=NOW() WHERE Iid=?";
        sql=mysql.format(sql,[Lidimg.Iid]);
        conn.query(sql);
      sql =
        "INSERT INTO `Image`( `Uid`, `image`, `Name`, `Time`, `Score`, `Imgid`) VALUES(?,?,?,?,?,?)";
      sql = mysql.format(sql, [
        imageData.Uid,
        imageData.image,
        imageData.Name,
        dateold,
        imageData.Score,
        imageData.Imgid
      ]);
      conn.query(sql, (err, result) => {
        if (err) throw err;
        console.log("affected_row:"+ result.affectedRows);
        // res.status(201).json({ affected_row: result.affectedRows });
      });
    }else{
      // res.status(555).send("เวลาน้อยกว่า เวลาปัจจุบัน"+dateold.getDate()+" "+datenow.getDate());
    }
  });
}else{
  // res.status(201).send("ไม่มีรูปที่ต้อง update");
}
});
});

  // add image
  router.post('/', async (req, res)=>{//req รับเข้ามา res ส่งออก
    const image :imagemodel=req.body;
    let sql="INSERT INTO `Image`(`Uid`, `image`, `Name`, `Time`, `Score`,`Imgid`) VALUES (?,?,?,NOW(),?,?)";
    
    sql =mysql.format(sql,[
        image.Uid,
        image.image,
        image.Name,
        0,
        0
    ])
    
    conn.query(sql,async (err,result)=>{
        if (err) throw err;
           sql=mysql.format("UPDATE `Image` SET `Imgid`=? WHERE `Iid`=?",[result.insertId,result.insertId]);
           conn.query(sql);
           res.status(201).json({ affected_row: result.affectedRows, last_idx: result.insertId });
        });
        // let body = req.body; 
        // res.status(201).json({ttt:'dfdfdf'});
});

/// del image
router.delete("/:Iid", (req, res) => {
    let Iid = +req.params.Iid;
    conn.query("delete from `Vote` where Iid = ?", [Iid], (err, result) => {
    if (err) throw err;
        conn.query("DELETE FROM `Image` WHERE `Imgid` = ?", [Iid], (err, result) => {
            if (err) throw err;
                res
                .status(200)
                .json({ affected_row: result.affectedRows });
        });
    });
      
});

// ค้นtop 10 today
router.get("/top/:id", (req, res) => {
    let topnum = +req.params.id;
    conn.query("SELECT `Iid`, `Uid`, `image`, `Name`, `Time`, `Score` FROM `Image` WHERE DATE(`Time`) = CURDATE() ORDER BY `Score` DESC LIMIT ?;" ,[topnum], (err, result) => {
    if (err) throw err;
      res.json(result);
    });
  });

  //get image by Iid
  router.get("/id/:Iid", (req, res) => {
    let Iid = +req.params.Iid;
    conn.query("SELECT `Iid`, `Uid`, `image`, `Name`, `Time`, `Score` FROM `Image` WHERE Iid=?;" ,[Iid], (err, result) => {
    if (err) throw err;
      res.json(result);
    });
  });

// get top all เรียงคะแนนมากสุด
  router.get("/topall", (req, res) => {
    // let Iid = +req.params.Iid;
    conn.query("SELECT `Iid`, `Uid`, `image`, `Name`, `Time`, `Score` FROM `Image` WHERE DATE(`Time`) = CURDATE() ORDER BY `Score` DESC;" , (err, result) => {
    if (err) throw err;
      res.json(result);
    });
  });

  // get top all เรียงคะแนนมากสุด และเวลาไม่เกินที่ admin กำหนด
  router.get("/topallrank", (req, res) => {
    // let Iid = +req.params.Iid;
    conn.query("SELECT `Iid`, `Uid`, `image`, `Name`, `Time`, `Score` FROM `Image` WHERE DATE(`Time`) = CURDATE() AND TIMESTAMPDIFF(SECOND, `Time`, NOW()) > (SELECT `Time` FROM `admin`) ORDER BY `Score` DESC;" , (err, result) => {
    if (err) throw err;
      res.json(result);
    });
  });

    // get top all เรียงคะแนนมากสุด และเวลาไม่เกินที่ admin กำหนด////////////////////
    router.get("/topallrank/:Uid", (req, res) => {
      let Uid = +req.params.Uid;
      conn.query("SELECT `Iid`, `Uid`, `image`, `Name`, `Time`, `Score` FROM `Image` WHERE DATE(`Time`) = CURDATE() AND `Iid`NOT IN ( SELECT `Iid` FROM `Vote` WHERE DATE(`Time`) = CURDATE() AND `Uid` = ? AND Vote=1 AND TIMESTAMPDIFF(SECOND, `Time`, NOW()) < (SELECT `Time` FROM `admin`) GROUP BY `Iid`) ORDER BY `Score` DESC" ,[Uid], (err, result)=> {
      // conn.query("SELECT `Iid`, `Uid`, `image`, `Name`, `Time`, `Score` FROM `Image` WHERE DATE(`Time`) = CURDATE() AND (SELECT `Time` FROM `admin`) > (SELECT `Time` FROM `admin`) ORDER BY `Score` DESC;" , (err, result) => {
      if (err) throw err;
        res.json(result);
      });
    });
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 //ตรวจจากid
  router.get("/HistoryByID", (req, res) => {
    // let Iid = +req.params.Iid;
    const Iid  = req.query.Iid;

    conn.query("SELECT  `Iid`, `Uid`, `image`, `Name`, `Time`, `Score`, (SELECT COUNT(*) + 1 FROM Image AS t2 WHERE t2.`Score` > t1.`Score` and t1.Time=t2.Time) AS ranking FROM Image AS t1 WHERE t1.Imgid=? ORDER BY DATE(t1.`Time`) DESC;" ,[Iid], (err, result) => {
      if (err) throw err;
      res.json(result);
    });
  });
   //ตรวจจาก uid
   router.get("/byuid", (req, res) => {
    // let Iid = +req.params.Iid;
    const uid  = req.query.uid;

    conn.query("SELECT  `Iid`, `Uid`, `image`, `Name`, `Time`, `Score` FROM Image WHERE Uid=? and DATE(`Time`) = CURDATE() ORDER BY Iid ASC;" ,[uid], (err, result) => {
      if (err) throw err;
      res.json(result);
    });
  });
  //ตรวจวันย้อนหลัโดย ลบจากวันนี้ all
  router.get("/History/:day", (req, res) => {
    let day = +req.params.day;
    conn.query("SELECT  `Imgid`as Iid, `Uid`, `image`, `Name`, `Time`, `Score`, (SELECT COUNT(*) + 1 FROM Image AS t2 WHERE DATE(`Time`) = CURDATE() - INTERVAL ? DAY and t2.`Score` > t1.`Score`) AS ranking FROM Image AS t1 WHERE DATE(`Time`) = CURDATE() - INTERVAL ? DAY ORDER BY `Score` DESC;" ,[day,day,], (err, result) => {
      if (err) throw err;
      res.json(result);
    });
  });

  //ค้น all today
router.get("/all", (req, res) => {
    // let id = +req.params.id;
    conn.query("select * from `Image`" , (err, result) => {
    if (err) throw err;
      res.json(result);
    });
  });


//update image date
  router.put("/updateimage/day", async (req, res) => {
    // let Iid = +req.params.Iid;
    const queryAsync=util.promisify(conn.query).bind(conn);

    conn.query("SELECT Iid FROM Image AS t1 WHERE DATE(`Time`) = CURDATE() - INTERVAL 1 DAY ORDER BY `Score` DESC;" , async (err, allimage) => {
      if (!err || allimage.length>0 ){
      allimage.forEach(async (Lidimg: any) => {
        console.log(Lidimg.Iid);

    let sql = mysql.format("select * from `Image` where Iid = ?", [Lidimg.Iid]);
  
    let result = await queryAsync(sql);
    let imageData = JSON.parse(JSON.stringify(result));
    imageData = imageData[0] as imagemodel
    console.log(imageData);
    
    const datenow =new Date();
    const timestamp = Date.parse(imageData.Time);
    const dateold = new Date(timestamp);
    // console.log(datenow);
    console.log("now"+datenow.getDate());
    console.log("old"+dateold.getDate());
    // console.log(dateold);
    // console.log(imageData);
    const isSameDate = (dateold: Date, datenow: Date) => {
      return dateold.getDate() < datenow.getDate() &&
            dateold.getMonth() <= datenow.getMonth() &&
            dateold.getFullYear() <= datenow.getFullYear();

  }
  console.log(isSameDate(dateold,datenow))
    if (isSameDate(dateold,datenow)){
        sql ="UPDATE `Image` SET `Time`=NOW() WHERE Iid=?";
        sql=mysql.format(sql,[Lidimg.Iid]);
        conn.query(sql);
      sql =
        "INSERT INTO `Image`( `Uid`, `image`, `Name`, `Time`, `Score`, `Imgid`) VALUES(?,?,?,?,?,?)";
      sql = mysql.format(sql, [
        imageData.Uid,
        imageData.image,
        imageData.Name,
        dateold,
        imageData.Score,
        imageData.Imgid
      ]);
      conn.query(sql, (err, result) => {
        if (err) throw err;
        console.log("affected_row:"+ result.affectedRows);
        // res.status(201).json({ affected_row: result.affectedRows });
      });
    }else{
      // res.status(555).send("เวลาน้อยกว่า เวลาปัจจุบัน"+dateold.getDate()+" "+datenow.getDate());
    }
  });
}else{
  res.status(201).send("ไม่มีรูปที่ต้อง update");
}
});
});

router.put("/updateimgIid", (req, res) => {
  // let id = +req.params.id;
  const newdata :imagemodel=req.body;
  conn.query("delete from `Vote` where Iid = ?", [newdata.Imgid], (err, result) => {
    if (err) throw err;
    conn.query("UPDATE `Image` SET`Uid`=?,`image`=?,`Name`=?,`Time`=NOW(),`Score`=0 WHERE Iid = ?" ,[newdata.Uid,newdata.image,newdata.Name,newdata.Imgid], (err, result) => {
    if (err) throw err;
      res.json(result);
    });
  });
});
