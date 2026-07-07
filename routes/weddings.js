import { Router } from "express";

const router = Router();

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