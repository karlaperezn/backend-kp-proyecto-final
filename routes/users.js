import { Router } from "express";
import bcrypt from "bcrypt"

const router = Router();

router.get("/", async (req, res) => {
    let allUsers = await req.app.locals.db.collection('users').find().toArray()
    res.send({data: allUsers})
})


router.post("/register-user", async (req, res) => {
    const fullName = req.body.fullName;
    const email = req.body.email;
    const password = req.body.password;
    const now = new Date();

    let newUser = await req.app.locals.db.collection('users').insertOne({
        fullName,
        email,
        password,
        createdAt: now,
        updatedAt: now
    })

    res.send({data: newUser, mensaje: 'usuario registrado'})
})

//////////////



export default router;