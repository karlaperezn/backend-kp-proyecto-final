import { Router } from "express";
import { ObjectId } from "mongodb"

const router = Router();


router.post("/:weddingId/add-collab", async (req, res) => {
    const weddingId = new ObjectId(req.params.weddingId);
    const emailCollab = req.body.emailCollab;

    let message;
    let status;
    let collabAdded;
    let userData;

    const wedding = await req.app.locals.db.collection('weddings').findOne({ _id: weddingId });

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
                role: 'viewer'
            })

            message = 'Colaborador añadido'
            status = true
            userData = {
                id: userCollab._id,
                fullName: userCollab.fullName,
                email: userCollab.email,
            }
        }
    }

    res.send({ user: userData, status, message })
})

export default router;