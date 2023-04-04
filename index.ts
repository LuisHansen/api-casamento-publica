import express from 'express';
import bodyParser from 'body-parser';
import * as mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

import { ALL_CONVIDADOS, RSVP } from './routes.js';
import {Familia, FamiliaSchema} from './listaDeFamilias';

dotenv.config();
const app = express();
app.use(cors())

const jsonParser = bodyParser.json()

let db;

const main = async () => {
    const {
        MONGO_URL,
        API_PORT = 8000,
    } = process.env;

    console.log('=== env', MONGO_URL, API_PORT);

    await mongoose.connect(
        MONGO_URL as string
    ).then((dbConnection)=>{
        db = dbConnection;
    });

    const FamiliaModel = mongoose.model('convidados', FamiliaSchema);

    app.get('/', (req, res) => {
        res.send('working');
    });

    app.get(ALL_CONVIDADOS, async (req, res) => {
        const familias = await FamiliaModel.find({}).select({ 'id': 1, 'convidados': 1, '_id': 1});
        res.send(familias);
    });

    app.get(RSVP, async (req, res) => {
        const {
            id
        } = req.params;

        // const familia = dicionarioDeFamilias[id];
        const familia = await FamiliaModel.find({ id }).select({ 'id': 1, 'convidados': 1, '_id': 0});

        if (!id || !familia) {
            res.status(404).send('Familia não encontrada!');
            return;
        }

        res.send(familia);
    });

    type AddFamilyPost = {
        familia: Familia,
    }

    app.post('/add-family', async (req, res) => {
        const {
            body,
        } = req;

        const {
            familia,
        }: AddFamilyPost = body as AddFamilyPost;

        const novaFamilia = new FamiliaModel(familia);
        await novaFamilia.save();

        res.send(novaFamilia);
    });

    type RSVPPost = {
        confirmar?: string[],
        desconfirmar?: string[],
    }

    app.post(RSVP, jsonParser, async (req, res) => {
        const {
            body,
            params: {
                id,
            },
        } = req;
        const {
            confirmar,
            desconfirmar,
        }: RSVPPost = body as RSVPPost;

        if (confirmar) {
            await FamiliaModel.updateOne({
                id,
            }, {
                $set: {
                    'convidados.$[e].confirmado': true,
                },
            }, {
                arrayFilters: [{
                    'e._id': {
                        $in: confirmar,
                    },
                }],
            });
        }

        if (desconfirmar) {
            await FamiliaModel.updateOne({
                id,
            }, {
                $set: {
                    'convidados.$[e].confirmado': false,
                },
            }, {
                arrayFilters: [{
                    'e._id': {
                        $in: desconfirmar,
                    },
                }],
            });
        }

        res.status(200).send();
    });

    app.listen(Number(API_PORT), () => {
        console.log(`api-casamento listening on port ${API_PORT}`);
    })
}

main().catch(err => console.log(err));
