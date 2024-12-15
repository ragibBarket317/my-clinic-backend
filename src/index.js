import dotenv from "dotenv";
import { app } from "./app.js";
import "./db/collectionsCleaningScheduler.js";
// import "./db/emailNotifyCron.js";
import connectDB from "./db/index.js";
import "./db/missedAptCron.js";

dotenv.config({
  path: "./.env",
});

// app.get("/", (req, res) => res.send("Express on Vercel"));

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log(error);
      throw error;
    });
    // app.listen(process.env.PORT || 8000, () => {
    //   console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    // });
  })
  .catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
  });
