import e from "express";
import { MongoClient } from "mongodb";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = e();

app.use(cors());
app.use(e.urlencoded({ extended: false }));
app.use(e.json());

app.listen(process.env.PORT || 3000);

app.post("/register-user", async (req, res) => {
  res.send("hola");
});

await connectDB();

async function connectDB() {
  const url = process.env.db;
  console.log(url);
  const client = await MongoClient.connect(url);
  app.locals.db = client.db("rsvp");
  console.log("mongo conectado");
}
