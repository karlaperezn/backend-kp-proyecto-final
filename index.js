import e from "express";
import { MongoClient } from "mongodb";
import cors from "cors";
import dotenv from "dotenv";
import users from "./routes/users.js";
import guests from "./routes/guests.js";
import weddings from "./routes/weddings.js"
import collabs from "./routes/collabs.js"


dotenv.config();

const app = e();

app.use(cors());
app.use(e.urlencoded({ extended: false }));
app.use(e.json());

app.listen(process.env.PORT || 3001);

app.use("/users", users);
app.use("/collabs", collabs);
app.use("/guests", guests);
app.use("/weddings", weddings);


await connectDB();

async function connectDB() {
  const url = process.env.db;
  console.log(url);
  const client = await MongoClient.connect(url);
  app.locals.db = client.db("rsvp");
  console.log("mongo conectado");
}
