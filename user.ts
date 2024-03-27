// import express from "express";
const express = require('express');
import mysql from "mysql";
import { usermodel } from "./model/user";
import * as crypto from 'crypto';

export const router = express.Router();
export const conn = mysql.createPool({
    connectionLimit: 10,
    host: "202.28.34.197",
    user: "web65_64011212157",
    password: "64011212157@csmsu",
    database: "web65_64011212157",
  });

//register สมัคร
router.post('/', async (req:any, res:any)=>{//req รับเข้ามา res ส่งออก  register
    const user :usermodel=req.body;
    const queryAsync=util.promisify(conn.query).bind(conn);
    let sql = mysql.format("SELECT `Email` FROM `User` WHERE Email=?", [user.Email]);
    let result = await queryAsync(sql);
    if (Array.isArray(result) && result.length > 0) {
        res.status(555).send("Email valid")
        console.log('มีข้อมูลใน result:', result);
    } else {
        sql="INSERT INTO `User`( `Name`, `Email`, `Password`, `Profileimage`, `Detail`, `Type`) VALUES(?,?,?,?,?,?)";
            sql =mysql.format(sql,[
                user.Name,
                user.Email,
                user.Password,
                user.Profileimage="https://cdn.pixabay.com/photo/2023/06/05/01/53/kitten-8041226_1280.jpg",
                user.Detail=" say sumeting",
                user.Type=0
            ])
            conn.query(sql,(err,result)=>{
                
                if (err) throw err;
                    res.status(201).json({ affected_row: result.affectedRows, last_idx: result.insertId }); 
                });
            }
       
        
    }
    
    
});

//login
router.post('/login', async (req:any, res:any)=>{//req รับเข้ามา res ส่งออก  register
    const user :usermodel=req.body;
    const queryAsync=util.promisify(conn.query).bind(conn);
    let sql = mysql.format("SELECT `Uid`, `Name`, `Email`, `Password`, `Profileimage`, `Detail`, `Type` FROM `User` WHERE Email=?", [user.Email]);
    let result = await queryAsync(sql);
    const userData = JSON.parse(JSON.stringify(result));
    if (Array.isArray(result) && result.length > 0) {
       
                if (pwresult) {
                    res.status(201).json({pwresult:pwresult, last_idx: userData[0].Uid,status : userData[0].Type });
                    console.log('Password is correct');
                } else {
                    res.status(201).json(pwresult);
                    // res.status(201).json({message:"Password is incorrect"});
                    console.log('Password is incorrect');
                }
            }
      
        console.log('มีข้อมูลใน result:', result);
    } else {
        res.status(201).json({message:"Email is incorrect"});
        }
});

// แสดง user ทั้งหมด  แสดงตาม id
router.get('/', (req:any, res:any)=>{
    if (req.query.id) {
        conn.query("SELECT `Uid`, `Name`, `Email`, `Password`, `Profileimage`, `Detail`, `Type` FROM `User` WHERE Uid=?" , [req.query.id],(err, result)=>{
            if (err){
                res.status(401).json(err);
            }else{
                res.status(201).json(result);
            }
          });
      } else {
        conn.query("SELECT `Uid`, `Name`, `Email`, `Password`, `Profileimage`, `Detail`, `Type` FROM `User`",(err, result)=>{
            if (err){
                res.status(401).json(err);
            }else{
                res.status(201).json(result);
            }
          });
      }
});

//delete user
router.delete("/:id", (req:any, res:any) => {
    let id = +req.params.id;
    conn.query("DELETE FROM `User` WHERE Uid=?", [id], (err, result) => {
       if (err) throw err;
       res
         .status(200)
         .json({ affected_row: result.affectedRows });
    });
});

//update
import util from "util"

  router.put("/:id", async (req:any, res:any) => {
    let id = +req.params.id;
    let user: usermodel = req.body;
    let userOriginal: usermodel | undefined;
    const queryAsync=util.promisify(conn.query).bind(conn);
  
    let sql = mysql.format("select * from User where Uid = ?", [id]);
  
    let result = await queryAsync(sql);
    const rawData = JSON.parse(JSON.stringify(result));
    console.log(rawData);
    userOriginal = rawData[0] as usermodel;
    console.log(userOriginal);
  
    let updateUser = {...userOriginal, ...user};
    console.log(user);
    console.log(updateUser);
  
      sql =
        "UPDATE `User` SET `Name`=?,`Email`=?,`Profileimage`=?,`Detail`=? WHERE Uid=?";
      sql = mysql.format(sql, [
        updateUser.Name,
        updateUser.Email,
        updateUser.Profileimage,
        updateUser.Detail,
        id,
      ]);
      conn.query(sql, (err, result) => {
        if (err) throw err;
        res.status(201).json({ affected_row: result.affectedRows });
      });
  });

  //repassword
  router.put("/repw/:id", async (req:any, res:any) => {
    let id = +req.params.id;
    let user: usermodel = req.body;
    const queryAsync=util.promisify(conn.query).bind(conn);
    let sql = mysql.format("select * from User where Uid = ?", [id]);
    let result = await queryAsync(sql);
    const userData = JSON.parse(JSON.stringify(result));
    if (user.Email==userData[0].Email){
    
                let sql="UPDATE `User` SET `Password`=? WHERE Uid=?";
                sql =mysql.format(sql,[
                    user.Password,
                    id
                ])
                conn.query(sql,(err,result)=>{
                    
                    if (err) throw err;
                        res.status(201).json({ affected_row: result.affectedRows}); 
                    });
                }
           
        }else{
            res.status(555).send("Email invalid")
        }
    });
    
