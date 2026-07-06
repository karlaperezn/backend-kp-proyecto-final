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
    

    let weddingAdded = await req.app.locals.db.collection('weddings').insertOne({
        ownerId,
        slug: `boda-${brideName}-&-${groomName}-${eventDate}`,

        brideName,
        groomName,
        eventDate,

        ceremony,
        reception,

        design,

        timestamps: true 
    })

    res.send({ data: weddingAdded, mensaje: 'Evento creado' })
})

export default router;