import { Router } from "express";
import bcrypt from "bcrypt"

const router = Router();

router.post("/register-user", async (req, res) => {
    const fullName = req.body.fullName;
    const email = req.body.email;
    const password = req.body.password;

    let newUser = await req.app.locals.db.collection('users').insertOne({
        fullName,
        email,
        password,
        timestamps: true
    })

    res.send({data: newUser, mensaje: 'usuario registrado'})
})

//////////////



export default router;