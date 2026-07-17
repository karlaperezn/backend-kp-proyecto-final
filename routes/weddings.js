import { Router } from "express";
import { ObjectId } from "mongodb";

const router = Router();

router.get('/my-weddings/:userId', async (req, res) => {
    const userId = req.params.userId

    const weddingsByMe = await req.app.locals.db.collection('weddings').find({ ownerId: new ObjectId(userId) }).toArray();
    const weddingsOwned = weddingsByMe.map(weddingByMe => ({...weddingByMe, role: 'admin'}))

    //Collabs
    const collabs = await req.app.locals.db.collection('collabs').find({ userId: new ObjectId(userId) }).toArray()
    const idWeddingCollabs = collabs.map(collab => new ObjectId(collab.weddingId));
    const weddingsSearch = await req.app.locals.db.collection('weddings').find({ _id: { $in: idWeddingCollabs } }).toArray()

    const weddingCollabs = await weddingsSearch.map(wedding => {
        const collab = collabs.find(collab => collab.weddingId.toString() === wedding._id.toString())
        return {
            _id: wedding._id,
            slug: wedding.slug,
            brideName: wedding.brideName,
            groomName: wedding.groomName,
            eventDate: wedding.eventDate,
            collabId: collab._id,
            role: collab.role
        }
    })
    res.send({ weddingsOwned, weddingCollabs})
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

    let status;
    let message;
    let weddingAdded;

    try {
        weddingAdded = await req.app.locals.db.collection('weddings').insertOne({
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

        status = true;
        message = 'Evento creado';

    } catch (error) {
        status = false;
        message = 'Error al crear el evento. Inténtalo de nuevo.';
    }

    res.send({ data: weddingAdded, status, message })
})


//web invitados
router.get('/:weddingSlug', async (req, res) => {
    const weddingSlug = req.params.weddingSlug;

    let status;
    let message;
    let wedding;

    try {
        wedding = await req.app.locals.db.collection('weddings').findOne({ slug: weddingSlug });
        status = true;
        message = `Boda de ${wedding.brideName} y ${wedding.groomName}`
    } catch (error) {
        status = false;
        message = "Esta web no existe"
    }

    res.send({wedding, status, message})

})

export default router;