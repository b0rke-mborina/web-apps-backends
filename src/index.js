const express = require("express");
const storage = require("./memory_storage.js");
const cors = require("cors");
const connect = require("./db.js");
const mongo = require("mongodb");

const app = express(); // instanciranje aplikacije
const port = 3000; // port na kojem će web server slušati

app.use(cors());
app.use(express.json()); // automatski dekodiraj JSON poruke

app.post('/posts', (req, res) => {
    let data = req.body;

    // ovo inače radi baza (autoincrement ili sl.), ali čisto za primjer
    data.id = 1 + storage.posts.reduce((max, el) => Math.max(el.id, max), 0);

    // dodaj u našu bazu (lista u memoriji)
    storage.posts.push(data);

    // vrati ono što je spremljeno
    res.json(data); // vrati podatke za referencu
});

app.get('/posts', async (req, res) => {
    let db = await connect();
    let query = req.query;

    let selekcija = {};

    if (query._any) {
        // za upit: /posts?_all=pojam1 pojam2
        let pretraga = query._any;
        let terms = pretraga.split(' ');

        let atributi = ['title', 'createdBy'];

        selekcija = {
            $and: [],
        };

        terms.forEach((term) => {
            let or = {
                $or: [],
            };

            atributi.forEach((atribut) => {
                or.$or.push({ [atribut]: new RegExp(term) });
            });

            selekcija.$and.push(or);
        });
    }

    console.log('Selekcija', selekcija);

    let cursor = await db.collection('posts').find(selekcija);
    let results = await cursor.toArray();

    res.json(results);
});

app.get('/posts_memory', (req, res) => {
    let posts = storage.posts;
    let query = req.query;

    if (query.title) {
        posts = posts.filter((e) => e.title.indexOf(query.title) >= 0);
    }

    if (query.createdBy) {
        posts = posts.filter((e) => e.createdBy.indexOf(query.createdBy) >= 0);
    }

    if (query._any) {
        let terms = query._any.split(' ');
        posts = posts.filter((doc) => {
            let info = doc.title + ' ' + doc.createdBy;
            return terms.every((term) => info.indexOf(term) >= 0);
        });
    }

    // sortiranje
    posts.sort((a, b) => b.postedAt - a.postedAt);

    res.json(posts);
});

app.listen(port, () => console.log(`Slušam na portu ${port}!`));

app.get('/posts/:id', async (req, res) => {
	// parametri rute dostupni su u req.params
	let id = req.params.id;
	// spoji se na bazu
	let db = await connect();
	// za dohvat jednog dokumenta koristimo `findOne()`
	let document = await db.collection('posts').findOne({ _id: mongo.ObjectId(id)});
	res.json(document);
});


function validateEmail(mail) {
	validRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
	mail.value.match(validRegex) ? true : false;
}

app.post('/posts', async (req, res) => {
	let db = await connect();
	let doc = req.body;

	if (doc.title && doc.postedAt && validateEmail(doc.createdBy)) {
		let result = await db.collection('posts').insertOne(doc);
		if (result.insertedCount == 1) {
			res.json({
				status: 'success',
				id: result.insertedId,
			});
		} else {
			res.json({
				status: 'fail',
			});
		}
	}
});

app.put('/posts/:id', async (req, res) => {
	let doc = req.body;
	// ako postoji, brišemo _id u promjenama (želimo da ostane originalni _id)
	delete doc._id;
	let id = req.params.id;
	let db = await connect();
	let result = await db.collection('posts').replaceOne({ _id: mongo.ObjectId(id) }, doc);
	if (result.modifiedCount == 1) {
		res.json({
			status: 'success',
			id: result.insertedId,
		});
	} else {
		res.json({
			status: 'fail',
		});
	}
});

app.patch('/posts/:id', async (req, res) => {
	let doc = req.body;
	delete doc._id;
	let id = req.params.id;
	let db = await connect();
	let result = await db.collection('posts').updateOne(
		{ _id: mongo.ObjectId(id) },
		{
			$set: doc,
		}
	);
	if (result.modifiedCount == 1) {
		res.json({
			status: 'success',
			id: result.insertedId,
		});
	} else {
		res.json({
			status: 'fail',
		});
	}
});


app.get('/random-post', async (req, res) => {
	let db = await connect();
	let cursor = await db.collection('posts').find(); // {}, { fields: {_id: true} }
	let posts = await cursor.toArray();

	let ids = posts.map(post => post._id);
	let randomNumber = Math.floor(Math.random() * ids.length);
	let idOfPost = ids[randomNumber];

	let randomPost = posts.filter(post => post._id == idOfPost);
	res.json(randomPost);
	// zadatak nije riješen pomuću findOne() zbog performansi i jednostavnosti
});
