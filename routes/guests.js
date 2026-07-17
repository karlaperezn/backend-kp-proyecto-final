import { Router } from "express";
import { ObjectId } from "mongodb";

const router = Router();

router.get("/show-responses/:weddingId", async (req, res) => {
    const weddingId = new ObjectId(req.params.weddingId)

    const guestsResponses = await req.app.locals.db.collection('guests').find({ weddingId }).toArray()


    res.send({ guestsResponses })

})

router.post("/register-response", async (req, res) => {
    const {
        weddingId,
        fullName,
        email,
        attending,
        dietaryRestrictions,
        guestMessage
    } = req.body

    let message;
    let status;
    let guestResponse;

    if (!weddingId || !fullName || attending == null) {
        message = 'Faltan datos obligatorios';
        status = false;
    } else {
        try {
            guestResponse = await req.app.locals.db.collection('guests').insertOne({
                weddingId: new ObjectId(weddingId),
                fullName,
                email,
                attending,
                dietaryRestrictions,
                guestMessage,
                responseAt: new Date(),
            })
            message = '¡Confirmación recibida!';
            status = true;


        } catch (error) {
            message = 'Error al guardar la confirmación. Inténtalo de nuevo.';
            status = false;
        }

    }

    res.send({ guestResponse, message, status })
})


export default router;