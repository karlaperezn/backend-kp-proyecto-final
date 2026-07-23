import { Router } from "express";
import { ObjectId } from "mongodb"

const router = Router();

//Mostrar colaboradores
router.get('/:weddingId', async (req, res) => {
    const weddingId = req.params.weddingId;

    let message;
    let status;
    let usersCollab = [];

    try {
        usersCollab = await req.app.locals.db.collection('collabs')
            .find({ weddingId: new ObjectId(weddingId) }).toArray();

        if (usersCollab.length === 0) {
            status = false;
            message = "No tienes colaboradores para esta boda.";
        } else {
            status = true;
            message = "Colaboradores de tu boda";
        }

    } catch (error) {
        status = false;
        message = "Error al obtener los colaboradores";
    }

    res.send({ usersCollab, status, message });
})

router.post("/:weddingId/add-collab", async (req, res) => {
    const weddingId = req.params.weddingId;
    const emailCollab = req.body.emailCollab;

    let message;
    let status;
    let collabAdded;
    let userData;

    const wedding = await req.app.locals.db.collection('weddings').findOne({ _id: new ObjectId(weddingId) });

    try {

        if (!wedding) {
            message = "No existe ninguna boda con ese id";
            status = false;
    
        } else {
            const userCollab = await req.app.locals.db.collection('users').findOne({ email: emailCollab })
    
            if (!userCollab) {
                message = 'No existe un usuario con ese correo'
                status = false
    
            } else {
                collabAdded = await req.app.locals.db.collection('collabs').insertOne({
                    weddingId,
                    userId: new ObjectId(userCollab._id),
                    fullName: userCollab.fullName,
                    email: userCollab.email,
                    role: 'viewer'
                })
    
                message = 'Colaborador añadido'
                status = true
                userData = {
                    fullName: userCollab.fullName,
                    email: userCollab.email,
                }
            }
        }
    } catch (error) {
        status= false;
        message= "Error al añadir colaborador"
    }


    res.send({ userData, status, message })
})



export default router;