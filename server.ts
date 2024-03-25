import http from 'http'
import { app } from './app';
const port : number = parseInt(process.env.port || '3000'); //มันจะเอาport เครื่องมา ถ้าไม่ได้ตั้งไว้จะเอาport 3000 มาใช้แทน
// const host : string  = process.env.host || '10.160.74.65';
const server = http.createServer(app);


//npx nodemon server.ts
// server.listen(port, host, () => {
//     console.log(`Server is running on http://${host}:${port}`);
// });
server.listen(port,()=>{
    console.log("server is started")
})
