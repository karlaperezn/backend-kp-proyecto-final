import { Router } from "express";

const router = Router();

router.get('/my-weddings/:userId', async (req, res) => {
    const userId = req.params.userId

    const weddingsByMe = await req.app.locals.db.collection('weddings').find({ownerId: userId}).toArray();

    const allCollabs = await req.app.locals.db.collection('collabs').find({userId}).toArray()
    const idWeddingCollabs = allCollabs.map(collab => collab.weddingId)
    const weddingsCollabs = await req.app.locals.db.collection('weddings').find({_id: {$in: idWeddingsCollabs}}).toArray


    res.send({ weddingByMe,  weddingsCollabs})
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
        ownerId,
        slug: `boda-${brideName}-&-${groomName}-${eventDate}`,

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