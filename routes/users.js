import { Router } from "express";
import bcrypt from "bcrypt"

const router = Router();

router.get("/", async (req, res) => {
    let allUsers = await req.app.locals.db.collection('users').find().toArray()
    res.send({ data: allUsers })
})

router.post("/register-user", async (req, res) => {
    const fullName = req.body.fullName;
    const email = req.body.email;
    const password = req.body.password;

    let message = "";
    let newUser;

    if (!fullName || !email || !password) {
        message = "Todos los campos son obligatorios.";
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            message = "Formato de correo inválido.";
        } else {
            const emailExist = await req.app.locals.db
                .collection("users")
                .findOne({ email });

            if (emailExist) {
                message = 'Ya existe una cuenta con este correo.';
            } else {
                const saltRounds = 12;
                const passwordHash = await bcrypt.hash(password, saltRounds);
                const now = new Date();

                newUser = await req.app.locals.db.collection('users').insertOne({
                    fullName,
                    email,
                    passwordHash,
                    createdAt: now,
                    updatedAt: now
                });

                message = 'Usuario registrado';
            }
        }
    }


    res.send({ data: newUser, message })
})


//////////////

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    let message;
    let status;

    let verifiedUser = await req.app.locals.db
        .collection("users")
        .findOne({ email });

    if (!email || !password) {
        message = 'Correo y contraseña son obligatorios para ingresar.';
        status = false;
    } else {
        const passwordMatch = verifiedUser
            ? await bcrypt.compare(password, verifiedUser.passwordHash)
            : false;

        ({ status, message } = verifiedUser && passwordMatch
            ? { status: true, message: 'Usuario verificado' }
            : { status: false, message: 'credenciales incorrectas' });
    }

    res.send({ status, message, verifiedUser });
});


export default router;