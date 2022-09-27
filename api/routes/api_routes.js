const express = require('express')
const app = express()
const port = 3000
var bodyParser = require('body-parser')
// create application/json parser
var jsonParser = bodyParser.json()

const knex = require('knex')({ 
    client: 'pg', 
    debug: true, 
    connection: { 
        connectionString : process.env.DATABASE_URL, 
        ssl: { rejectUnauthorized: false }, 
      } 
}); 

let apiRouter = express.Router()

const endpoint = '/api/'
const lista_produtos = {
    produtos: [{
            id: 001,
            descricao: "Ração Canina Adulto",
            valor: 183.00,
            marca: "Special Dog"
        },
        {
            id: 002,
            descricao: "Brinquedo Latex Galinha",
            valor: 7.90,
            marca: "Napi"
        },
        {
            id: 003,
            descricao: "Tapete Higiênico",
            valor: 80.50,
            marca: "Super Secão"
        },
        {
            id: 004,
            descricao: "Petisco",
            valor: 15.80,
            marca: "Pedigree"
        },
        {
            id: 005,
            descricao: "Coleira Antipulgas",
            valor: 80.00,
            marca: "Scalibur"
        },
    ]
}

app.get(endpoint, jsonParser, function (req, res) {
    res.send('index');
})

app.get(endpoint + 'produtos', jsonParser, function (req, res) {
    knex.select('*').from('produto') 
    .then( produtos => res.status(200).json(produtos) ) 
    .catch(err => { 
        res.status(500).json({  
           message: 'Erro ao recuperar produtos - ' + err.message }) 
    })   
})

app.get(endpoint + 'produtos/:id', jsonParser, function (req, res) {
    knex.select('*').from('produto') 
    .where({id: req.params.id})
    .then( product => {
        if (!product) {
            return res.status(404).json();
        }
        res.status(200).json(product)
    }) 
    .catch(err => { 
        res.status(500).json({  
           message: 'Erro ao recuperar produtos - ' + err.message }) 
    })   
})

app.put(endpoint + 'produtos/:id', jsonParser, async function (req, res) {

    const { id } = req.params;
    const changes = req.body;

    try {
        const count = await knex('produto').where({ id }).update(changes)
        if (count) {
            res.status(200).json({ updated: count })
        } else {
            res.status(404).json({ message: "Record not found" })
        }
    } catch (err) {
        res.status(500).json({ message: "Erro atualizando produto", error: err })
    }
})

app.delete(endpoint + 'produtos/:id', jsonParser, function (req, res) {
    
    knex('produto')
        .delete().where({id: req.params.id}) 
        .then( product => {
            if (product) {
                return res.status(204).json()
            }

            return res.status(404).json()
        }) 
        .catch(err => { 
            res.status(500).json({  
            message: 'Erro ao deletar produtos - ' + err.message }) 
        })
})

app.post (endpoint + 'produtos', jsonParser, (req, res) => { 
    knex ('produto') 
        .insert({ 
            descricao: req.body.descricao,  
            valor: req.body.valor,  
            marca: req.body.marca 
        }, ['id']) 
        .then((result) => { 
            res.status(201).json({})  
            return 
        }) 
        .catch(err => { 
            res.status(500).json({  
                message: 'Erro ao registrar produto - ' + err.message }) 
        })   
}) 

app.listen(process.env.PORT || 3000, function () {
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});

module.exports = apiRouter;