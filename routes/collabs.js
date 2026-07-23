import { Router } from "express";
import { ObjectId } from "mongodb"

const router = Router();

//Mostrar colaboradores
router.get('/show-collabs/:weddingId', async (req, res) => {
    const weddingId = req.params.weddingId;

    let message;
    let status;
    let collabs;

    try {
        collabs = await req.app.locals.db.collection('collabs')
            .find({ weddingId: new ObjectId(weddingId) }).toArray();

        if (collabs.length === 0) {
            status = false;
            message = "No tienes colaboradores para esta boda";
        } else {
            status = true;
            message = "Colaboradores de tu boda";
        }

    } catch (error) {
        console.error(error);
        status = false;
        message = "Error al obtener los colaboradores";
    }

    res.send({ collabs, status, message });
})

router.post("/:weddingId/add-collab", async (req, res) => {
    const weddingId = req.params.weddingId;
    const emailCollab = req.body.emailCollab;

    let message;
    let status;
    let collabAdded;

    const wedding = await req.app.locals.db.collection('weddings').findOne({ _id: new ObjectId(weddingId) });

    try {

        if (!wedding) {
            message = "No existe ninguna boda con ese id";
            status = false;

        } else {
            const userCollab = await req.app.locals.db.collection('users').findOne({ email: emailCollab })

            if (!userCollab) {
                message = 'No existe un usuario con ese correo'
                status = false

            } else {
                const result = await req.app.locals.db.collection('collabs').insertOne({
                    weddingId: new ObjectId(weddingId),
                    userId: new ObjectId(userCollab._id),
                    fullName: userCollab.fullName,
                    email: userCollab.email,
                    role: 'viewer'
                })

                collabAdded = {
                    _id: result.insertedId,
                    weddingId: weddingId,
                    userId: userCollab._id,
                    fullName: userCollab.fullName,
                    email: userCollab.email,
                    role: 'viewer'
                };

                message = 'Colaborador añadido'
                status = true
            }
        }
    } catch (error) {
        console.error(error);
        status = false;
        message = "Error al añadir colaborador"
    }


    res.send({ collabAdded, status, message })
})

//Eliminar colaborador
router.delete("/delete-collab/:collabId", async (req, res) => {

    const collabId = req.params.collabId;
    let message;
    let status= false;
    let collabDelete;
    try {
        collabDelete = await req.app.locals.db.collection('collabs').deleteOne({ _id: new ObjectId(collabId) })

        if (collabDelete && collabDelete.deletedCount > 0) {
            message = "Colaboración eliminada"
            status = true
        } else {
            message = "No se encontró ninguna colaboración con ese ID";
            status = false
        }

    } catch (error) {
        console.error(error);
        message = "Error en eliminar la colaboración"
        status = false
    }


    res.send({ collabDelete, status, message })
})



export default router;