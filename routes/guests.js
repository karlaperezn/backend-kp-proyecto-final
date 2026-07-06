import { Router } from "express";

const router = Router();

router.post("/register-response", async (req, res) => {
    const {
        numberId,
        fullName,
        email,
        attending,
        food_allergy_intolerance,
        message
    } = req.body

    let guestResponse = await req.app.locals.db.collection('guests').insertOne({
        numberId,
        fullName,
        email,
        attending,
        food_allergy_intolerance,
        message
    })

    res.send({data: newUser, mensaje: 'Respuesta enviada'})
})


export default router;