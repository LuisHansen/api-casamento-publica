import {Schema} from "mongoose";

interface IDictionary<TValue> {
    [id: string]: TValue;
}

type Convidado = {
    _id: any;
    nome: string;
    confirmado: boolean;
    pagante: boolean;
}

export type Familia = {
    id: string;
    convidados: IDictionary<Convidado>;
}

export const ConvidadoSchema = new Schema<Convidado>({
    _id: {
        type: Schema.Types.ObjectId,
        index: true,
        required: true,
        auto: true,
    },
    nome: {
        type: Schema.Types.String,
        required: true,
    },
    confirmado: {
        type: Schema.Types.Boolean,
        required: true,
    },
    pagante: {
        type: Schema.Types.Boolean,
        required: true,
    },
})

export const FamiliaSchema = new Schema<Familia>({
    id: {
        type: Schema.Types.String,
        index: true,
        required: true,
    },
    convidados: {
        type: [ConvidadoSchema],
    }
});
