import { Router } from "express";
import { ObjectId } from "mongodb";

const router = Router();

router.get('/my-weddings/:userId', async (req, res) => {
    const userId = req.params.userId

    const weddingsByMe = await req.app.locals.db.collection('weddings').find({ ownerId: new ObjectId(userId) }).toArray();
    const weddingsOwned = weddingsByMe.map(weddingByMe => ({ ...weddingByMe, role: 'admin' }))

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
    res.send({ weddingsOwned, weddingCollabs })
})

//crear web rsvp
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


//mostrar web rsvp
router.get('/show-invite/:weddingSlug', async (req, res) => {
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

    res.send({ wedding, status, message })

})

//cargar web para editar
router.get('/preview/:weddingId', async (req, res) => {
    const weddingId = req.params.weddingId;

    let status;
    let message;
    let wedding;

    try {
        wedding = await req.app.locals.db.collection('weddings').findOne({ _id: new ObjectId(weddingId) });
        status = true;
        message = `Boda de ${wedding.brideName} y ${wedding.groomName}`
    } catch (error) {
        status = false;
        message = "Esta web no existe"
    }

    res.send({ wedding, status, message })

})

//editar web rsvp
router.put('/editar-boda/:weddingId', async (req, res) => {
    const weddingId = req.params.weddingId;
    const { userId, brideName, groomName, eventDate, ceremony, reception, design } = req.body;
    console.log('userId recibido:', userId);

    let status;
    let message;
    let weddingUpdated;

    const wedding = await req.app.locals.db.collection('weddings').findOne({ _id: new ObjectId(weddingId) });

    if (!wedding || wedding.ownerId.toString() !== userId) {
        status = false;
        message = 'No tienes permiso para editar esta boda';

    } else {
        try {
            weddingUpdated = await req.app.locals.db.collection('weddings').updateOne(
                { _id: new ObjectId(weddingId) },
                {
                    $set: {
                        slug: `${brideName}-y-${groomName}`.toLowerCase().replace(/\s+/g, '-'),
                        brideName,
                        groomName,
                        eventDate,
                        ceremony,
                        reception,
                        design,
                        updatedAt: new Date()
                    }
                }
            );

            status = true;
            message = 'Web RSVP actualizada';

        } catch (error) {
            status = false;
            message = 'Error al actualizar la web RSVP';
        }
    }

    res.send({ data: weddingUpdated, status, message });
})

export default router;