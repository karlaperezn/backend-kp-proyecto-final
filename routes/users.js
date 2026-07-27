import { Router } from "express";
import { ObjectId } from "mongodb";
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
    let status;

    if (!fullName || !email || !password) {
        message = "Todos los campos son obligatorios.";
        status = false;
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            message = "Formato de correo inválido.";
            status = false;
        } else {
            const emailExist = await req.app.locals.db
                .collection("users")
                .findOne({ email });

            if (emailExist) {
                message = 'Ya existe una cuenta con este correo.';
                status = false;
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
                status = true
                message = 'Usuario registrado';
            }
        }
    }


    res.send({ data: newUser, message, status })
})


//////////////

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    let message;
    let status;
    let dataUser;

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

        if (verifiedUser && passwordMatch) {
            status = true;
            message = 'Ususuario verificado';

            dataUser = {
                _id: verifiedUser._id,
                fullName: verifiedUser.fullName,
                email: verifiedUser.email
            }
        } else {
            status = false;
            message = 'Credenciales incorrectas';
        }

    }

    res.send({ status, message, user: dataUser });
});

//////////
router.put('/update-user/:userId', async (req, res) => {
    const userId = req.params.userId;
    const { fullName, email, password } = req.body;

    let message = "Error interno en el servidor";
    let status = false;
    let updateData = null;

    if (!userId) {
        status = false;
        message = "El Id del usuario no es válido";
    } else {
        try {
            const findUser = await req.app.locals.db.collection('users').findOne({ _id: new ObjectId(userId) });
            
            if (!findUser) {
                status = false;
                message = "El usuario especificado no existe";
            } else {
                const updateFields = {};

                if (fullName && fullName.trim() !== "") {
                    updateFields.fullName = fullName;
                }

                if (email && email.trim() !== "") {
                    updateFields.email = email;
                }

                if (password && password.trim() !== "") {
                    const saltRounds = 12;
                    const passwordHash = await bcrypt.hash(password, saltRounds);
                    updateFields.password = passwordHash;
                }

                if (Object.keys(updateFields).length === 0) {
                    message = "No se realizaron cambios en el perfil";
                    status = true;
                    updateData = {
                        fullName: findUser.fullName,
                        email: findUser.email
                    };
                } else {
                    const userDataChange = await req.app.locals.db.collection('users').updateOne(
                        { _id: new ObjectId(userId) }, 
                        { $set: updateFields }
                    );

                    if (userDataChange && userDataChange.modifiedCount > 0) {
                        message = "Datos de perfil actualizados con éxito";
                        status = true;
                        
                        updateData = {
                            fullName: updateFields.fullName || findUser.fullName,
                            email: updateFields.email || findUser.email
                        };
                    } else {
                        message = "No se realizaron cambios en el perfil";
                        status = true;
                        updateData = {
                            fullName: findUser.fullName,
                            email: findUser.email
                        };
                    }
                }
            }

        } catch (error) {
            console.error(error);
            status = false;
            message = "Error en la base de datos al actualizar el perfil";
        }
    }


    res.send({ updateData, status, message });
});




export default router;