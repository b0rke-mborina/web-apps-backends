const express = require("express");
const storage = require("./memory_storage.js");
const cors = require("cors");

const connect = require("./db.js");

const app = express()  // instanciranje aplikacije
const port = 3000  // port na kojem će web server slušati

app.use(cors())
app.use(express.json()) // automatski dekodiraj JSON poruke

/*app.post('/posts', (req, res) => {
    let data = req.body

    // ovo inače radi baza (autoincrement ili sl.), ali čisto za primjer
    data.id = 1 + storage.posts.reduce((max, el) => Math.max(el.id, max), 0)

    // dodaj u našu bazu (lista u memoriji)
    storage.posts.push(data)

    // vrati ono što je spremljeno
    res.json(data) // vrati podatke za referencu
})

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

    // sortiranje
    posts.sort((a, b) => (b.postedAt - a.postedAt))

    res.json(posts)
})*/

app.listen(port, () => console.log(`Slušam na portu ${port}!`))


/* čitanje postova iz MongoDB */
/*app.get('/posts', async (req, res) => {
	let db = await connect() // pristup db objektu
	let cursor = await db.collection("posts").find()
	let results = await cursor.toArray()
	res.json(results)
})*/

/* stari način iz memory_storage.js */
app.get('/posts_memory', (req, res) => {
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
	// sortiranje
	posts.sort((a, b) => (b.postedAt - a.postedAt))
	res.json(posts)
})

//connect...


/* čitanje postova iz MongoDB uz pretragu i filtriranje */
/*app.get('/posts', async (req, res) => {
	let query = req.query
	let filter = {}
	if (query.title) {
		filter["title"] = new RegExp(query.title)
	}
	console.log("Filter za Mongo", filter)
	let db = await connect()
	let cursor = await db.collection("posts").find(filter).sort({postedAt: -1})
	let results = await cursor.toArray()
	// Premještanje atributa _id u id
	results.forEach(e => {
		e.id = e._id
		delete e._id
	})
	res.json(results)
})*/


app.get('/posts', async (req, res) => {
	let db = await connect()
	let query = req.query;
	let selekcija = {}
	if (query._any) { // za upit: /posts?_any=pojam1 pojam2	--> _all
		let pretraga = query._any
		let terms = pretraga.split(' ')
		let atributi = ["title", "createdBy"]
		selekcija = {
			$and: [],
		};
		terms.forEach((term) => {
			let or = {
				$or: []
			};
			atributi.forEach(atribut => {
				or.$or.push({ [atribut]: new RegExp(term) });
			})
			selekcija.$and.push(or);
		});
	}
	console.log("Selekcija", selekcija)
	let cursor = await db.collection("posts").find(selekcija)
	let results = await cursor.toArray()
	res.json(results)
})

app.get('/custom-posts', async (req, res) => {
	let db = await connect();

	monthData=new Date();
	console.log(monthData);
	monthData.setMonth(monthData.getMonth() - 6);
	console.log(monthData);
	
	let cursor = await db.collection("posts")
		.find( { postedAt: { $gte: monthData } } )
		.sort( { postedAt: -1 });
	let results = await cursor.toArray();
	res.json(results);
})

async function getCreatedBy(db, query, selection) {
	if (query.createdBy) {
		let pretraga = query.createdBy
		let terms = pretraga.split(' ')
		let atribut = "createdBy";
		selekcija = {
			$or: [],
		};
		terms.forEach((term) => {
			selekcija.$or.push({ [atribut]: new RegExp("^" + term) });
		});
	}
	console.log("Selekcija", selekcija)
	let cursor = await db.collection("posts").find(selekcija)
	let results = await cursor.toArray()
	return results;
}

app.get('/posts-createdBy', async (req, res) => {
	let db = await connect()
	let query = req.query;
	let selekcija = {}
	let results = await getCreatedBy(db, query, selekcija);
	res.json(results)
})

async function dohvati(db, stranica, velicina) {
	let cursor = await db.collection("posts")
		.find()
		.limit(velicina)
		.skip((stranica - 1) * velicina);
	let results = await cursor.toArray();
	console.log(results);
	return results;
}

app.get("/posts-pagination", async (req, res) => {
	let db = await connect()
	let response = await dohvati(db, 5, 10);
	// dohvaća 5. stranicu gdje svaka stranica sadrži 10 postova
	res.json(response);
})