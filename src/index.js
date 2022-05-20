const express = require("express");
const storage = require("./memory_storage.js");
const cors = require("cors");
const connect = require("./db.js");
const mongo = require("mongodb");

const app = express(); // instanciranje aplikacije
const port = 3000; // port na kojem će web server slušati

app.use(cors());
app.use(express.json()); // automatski dekodiraj JSON poruke

app.post('/posts_memory', (req, res) => {
    let data = req.body;

    // ovo inače radi baza (autoincrement ili sl.), ali čisto za primjer
    data.id = 1 + storage.posts.reduce((max, el) => Math.max(el.id, max), 0);

    // dodaj u našu bazu (lista u memoriji)
    storage.posts.push(data);

    // vrati ono što je spremljeno
    res.json(data); // vrati podatke za referencu
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

app.put('/posts/:id', async (req, res) => {
    let doc = req.body;
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

app.post('/posts', async (req, res) => {
    let db = await connect();
    let doc = req.body;

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
});

app.get('/posts/:id', async (req, res) => {
    let id = req.params.id;
    let db = await connect();
    let document = await db.collection('posts').findOne({ _id: mongo.ObjectId(id) });

    res.json(document);
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

    let cursor = await db.collection('posts').find(selekcija);
    let results = await cursor.toArray();

    res.json(results);
});

app.listen(port, () => console.log(`Slušam na portu ${port}!`));

app.post('/posts/:postId/comments', async (req, res) => {
	let db = await connect();
	let doc = req.body;
	let postId = req.params.postId;
	doc["postId"] = postId

	let result = await db.collection('comments').insertOne(doc);
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
	/*// u mongu dokumenti unutar postojećih dokumenata ne dobivaju
	// automatski novi _id, pa ga moramo sami dodati
	doc._id = mongo.ObjectId();
	// datume je ispravnije definirati na backendu
	doc.posted_at = Date.now();
	let result = await db.collection('posts').updateOne(
		{ _id: mongo.ObjectId(postId) },
		{
		// operacija $push dodaje novu vrijednost u
		// atribut `comments`, a ako on ne postoji
		// automatski ga stvara i postavlja na []
			$push: { comments: doc },
		}
	);
	if (result.modifiedCount == 1) {
		res.json({
			status: 'success',
			id: doc._id, // kao id vraćamo generirani _id
		});
	} else {
		res.statusCode = 500;
		res.json({
			status: 'fail',
		});
	}*/
});

app.delete('/posts/:postId/comments/:commentId', async (req, res) => {
	let db = await connect();
	// let postId = req.params.postId;
	let commentId = req.params.commentId;

	let result = await db.collection('comments').deleteOne(
		{ _id: mongo.ObjectId(commentId) }
	);
	/*let result = await db.collection('posts').updateOne(
		{ _id: mongo.ObjectId(postId) },
		{
			// sada koristimo mongo direktivu $pull za micanje
			// vrijednosti iz odabranog arraya `comments`
			// komentar pretražujemo po _id-u
			$pull: { comments: { _id: mongo.ObjectId(commentId) } },
		}
	);*/
	if (result.deletedCount == 1) {
		res.statusCode = 201;
		res.send(); // "Delete successful! " + res.statusCode
	} else {
		res.statusCode = 500;
		res.json({
			status: 'fail',
		});
	}
});

app.get('/comments', async (req, res) => {
	let db = await connect();
	let query = req.query;

	let selekcija = {};

	if (query._any) {
		// za upit: /posts?_all=pojam1 pojam2
		let pretraga = query._any;
		let terms = pretraga.split(' ');
		let atributi = ['comment', 'email'];

		selekcija = {
			$or: [],
		};
		terms.forEach((term) => {
			atributi.forEach((atribut) => {
				selekcija.$or.push({ [atribut]: new RegExp(term) });
			});
		});
	}
	console.log("Selekcija", selekcija)
	let cursor = await db.collection('comments').find(selekcija);
	let results = await cursor.toArray();

	res.json(results);
});