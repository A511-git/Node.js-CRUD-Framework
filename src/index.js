import express from "express";
import { databaseConnection } from "./database/index.js";
import { expressApp } from "./express-app.js";
import {PORT} from "./config/index.js"

const runServer = async() => {
    const app = express();
    await databaseConnection();
    await expressApp(app);

    app.listen(PORT,()=>{
        console.log(`Server is running on port : ${PORT}`);
    })
    .on('error', (err) => {
        console.log(err);
        process.exit();
    }) 

}

runServer();