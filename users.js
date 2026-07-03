import { Router } from "express";

const router = Router();

router.post("/register-user", async (req, res) => {
    console.log(req.body)
    const fullName = req.body.fullName;
    const email = req.body.email;
    const passwordHash = req.body.passwordHash;

    let newUser = await req.app.locals.db.collection('users').insertOne({
        fullName,
        email,
        passwordHash,
        role: 'admin'
    })

    res.send({data: newUser, mensaje: 'usuario registrado'})
})

//////////////

router.post("/register-colab", async (req, res) => {
    const fullName = req.body.fullName;
    const email = req.body.email;
    const passwordHash = 'password123';
    const role = req.body.role;

    let newColab = await req.app.locals.db.collection('users').insertOne({
        fullName,
        email,
        passwordHash,
        role
    })

    res.send({data: newColab, mensaje: 'colaborador registrado'})

})

export default router;