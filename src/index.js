const express = require('express'); // import express from 'express';
const storage = require('./memory_storage.js'); // import storage from './memory_storage.js'
const cors = require('cors'); // import cors from 'cors'

const app = express()  // instanciranje aplikacije
const port = 3000  // port na kojem će web server slušati

app.use(cors())

app.get('/posts', (req, res) => {
    let posts = storage.posts
    let query = req.query
    
    if (query.title) {
        posts = posts.filter(e => e.title.indexOf(query.title) >= 0)
    }
    
    if (query.createdBy) {
        posts = posts.filter(e => e.createdBy.indexOf(query.createdBy) >= 0)
    }
    
    if (query._any) {
        let terms = query._any.split(" ")
        posts = posts.filter(doc => {
            let info = doc.title + " " + doc.createdBy
            return terms.every(term => info.indexOf(term) >= 0)
        })
    }

    res.json(posts)
})

app.use(express.json()) // automatski dekodiraj JSON poruke

app.post('/posts', (req, res) => {
	let data = req.body

	// ovo inače radi baza (autoincrement ili sl.), ali čisto za primjer
	data.id = 1 + storage.posts.reduce((max, el) => Math.max(el.id, max), 0)

	// dodaj u našu bazu (lista u memoriji)
	storage.posts.push(data)
	
	// vrati ono što je spremljeno
	res.json(data) // vrati podatke za referencu
})

app.listen(port, () => console.log(`Slušam na portu ${port}!`))