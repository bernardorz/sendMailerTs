import 'reflect-metadata'
import express from 'express';
import "./database/"
import { router } from './routes';
import { createConnection } from 'typeorm'

createConnection()

const app = express();


/*GET => Buscar POST => Salvar PUT => Alterar DELETE => Deletar PATCH => Alteração especifica*/

app.use(express.json())

app.use(router)

export { app }
