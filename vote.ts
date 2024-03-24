import express from "express";
import mysql from "mysql";
import { votemodel } from "./model/vote";

export const router = express.Router();
export const conn = mysql.createPool({
    connectionLimit: 10,
    host: "202.28.34.197",
    user: "web65_64011212157",
    password: "64011212157@csmsu",
    database: "web65_64011212157",
  });

  import util from "util"
import { imagemodel } from "./model/image";
  //add vote
  router.post('/', (req, res)=>{//req รับเข้ามา res ส่งออก
    const vote :votemodel=req.body;
    let sql="INSERT INTO `Vote`(`Iid`, `Uid`, `Time`, `Vote`, `Point`) VALUES (?,?,NOW(),?,?)";
    sql =mysql.format(sql,[
        vote.Iid,
        vote.Uid,
        vote.Vote,
        vote.Point
    ])
    conn.query(sql,async (err,result)=>{
        if (err) throw err;
            const queryAsync = util.promisify(conn.query).bind(conn);

            try {
                const sqlSelect = mysql.format("SELECT `Iid`, `Uid`, `image`, `Name`, `Time`, `Score` FROM `Image` WHERE `Iid` = ? ORDER BY `Time` DESC LIMIT 1", [vote.Iid]);
                const result:any = await queryAsync(sqlSelect);
                const timestamp = Date.parse(result.Time);
                const olddate = new Date(timestamp);
                if (result.length > 0) {//////////
                    const ScoreData = JSON.parse(JSON.stringify(result[0]));
                    if (vote.Vote == 1) {////////////////////////////////////////ถ้า 1 คือชนะโหวด 0คือแพ้โหวด
                        
                        ScoreData.Score += vote.Point;
                    } else {
                        if(ScoreData.Score-vote.Point<=0){
                            ScoreData.Score=0;
                        }else{
                            ScoreData.Score -= vote.Point;
                        }
                        
                    }
            
                    const sqlUpdate = mysql.format("UPDATE `Image` SET `Time`=NOW(),`Score` = ? WHERE `Iid` = ?", [ScoreData.Score, vote.Iid]);
                    await queryAsync(sqlUpdate);
            
                    res.status(201).json({ affected_row: 1, last_idx: vote.Iid });
                } else {
                    res.status(404).json({ message: "No data found for the provided Iid" });
                }
            } catch (error) {
                console.error("Error:", error);
                res.status(500).json({ error: "Internal Server Error" });
            }
        });
        // let body = req.body; 
        // res.status(201).json({ttt:'dfdfdf'});
});

//del all by Iid
router.delete("/:Iid", (req, res) => {
    let Iid = +req.params.Iid;
    conn.query("delete from `Vote` where Iid = ?", [Iid], (err, result) => {
       if (err) throw err;
       res
         .status(200)
         .json({ affected_row: result.affectedRows });
    });
});

// point ที่เพิ่มลดในแต่ละวัน จาก Iid
router.get("/:Iid", (req, res) => {
    let Iid = +req.params.Iid;
    conn.query("SELECT `Iid`, `Time`,SUM(CASE WHEN `Vote` = 1 THEN `Point` ELSE 0 END) AS Ppoint, SUM(CASE WHEN `Vote` = 0 THEN `Point` ELSE 0 END) AS Dpoint FROM `Vote` WHERE `Iid` = ? GROUP BY `Time`;" , [Iid], (err, result) => {
    if (err) throw err;
      res.json(result);
    });
  });





  const isSameDate = (dateold: Date, datenow: Date) => {
    return dateold.getDate() < datenow.getDate() &&
          dateold.getMonth() <= datenow.getMonth() &&
          dateold.getFullYear() <= datenow.getFullYear();

}