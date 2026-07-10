import { Router } from "express";
import { ObjectId } from "mongodb"

const router = Router();

router.get("/my-collabs/:userId", async (req, res) => {
    const userId = req.params.userId;
    let message;
    let weddingsCollabs = [];

    const allCollabs = await req.app.locals.db.collection('collabs')
        .find({ userId: new ObjectId(userId) }).toArray()

    if (allCollabs.length === 0) {
        message = 'No tienes colaboraciones'
    } else {
        const idWeddingCollabs = allCollabs.map(collab => new ObjectId(collab.weddingId))

        const weddings = await req.app.locals.db.collection('weddings')
            .find({ _id: { $in: idWeddingCollabs } }).toArray()

        weddingsCollabs = weddings.map(wedding => {
            const collab = allCollabs.find(c => c.weddingId.toString() === wedding._id.toString());
            return {
                _id: wedding._id,
                slug: wedding.slug,
                brideName: wedding.brideName,
                groomName: wedding.groomName,
                eventDate: wedding.eventDate,
                collabId: collab._id
            }
        })

        message = 'Colaboraciones encontradas'
    }

    res.send({ weddingsCollabs, message })
})

router.post("/:weddingId/add-collab", async (req, res) => {
    const weddingId = req.params.weddingId;
    const emailCollab = req.body.emailCollab;

    let message;
    let status;
    let collabAdded;
    let userData;

    const userCollab = await req.app.locals.db.collection('users').findOne({ email: emailCollab })
    if (!userCollab) {
        message = 'No existe un usuario con ese correo'
        status = false

    } else {
        let collabAdded = await req.app.locals.db.collection('collabs').insertOne({
            weddingId,
            userId: userCollab._id,
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


    res.send({ user: userData, status, message })
})

export default router;