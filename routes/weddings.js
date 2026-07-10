import { Router } from "express";
import { ObjectId } from "mongodb";

const router = Router();

router.get('/my-weddings/:userId', async (req, res) => {
    const userId = req.params.userId

    const weddingsByMe = await req.app.locals.db.collection('weddings').find({ ownerId: new ObjectId(userId) }).toArray();

    res.send({ weddingsByMe })
})

router.post('/new-wedding', async (req, res) => {
    const {
        ownerId,
        brideName,
        groomName,
        eventDate,
        ceremony,
        reception,
        design,
    } = req.body;
    const now = new Date();


    let weddingAdded = await req.app.locals.db.collection('weddings').insertOne({
        ownerId: new ObjectId(ownerId),
        slug: `${brideName}-y-${groomName}`.toLowerCase().replace(/\s+/g, '-'),

        brideName,
        groomName,
        eventDate,

        ceremony,
        reception,

        design,

        createdAt: now,
        updatedAt: now
    })

    res.send({ data: weddingAdded, mensaje: 'Evento creado' })
})

export default router;