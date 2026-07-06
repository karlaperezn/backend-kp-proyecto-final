import { Router } from "express";

const router = Router();

router.post("/add-collab", async (req, res) => {
    //Cómo obtengo el id de la boda?
    const emailCollab = req.body

    const userCollab = await req.app.locals.db.collection('users').findOne({email})

    let collabAdded = await req.app.locals.db.collection('collabs').insertOne({
        weddingId,
        userId: userCollab._id,
        role: 'viewer'
    })

    res.send({ data: collabAdded, mensaje: 'coladorador añadido' })
})

export default router;