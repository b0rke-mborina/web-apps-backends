const express = require("express");
const storage = require("./memory_storage");
const cors = require("cors");

const app = express();
const port = 3000;

app.use(cors()) // omogući CORS na svim rutama

let studentHandler = (req, res) => {
	// let upit = req.query;
	let upit = req.params
	// napravi nešto s upitom...

	let godina = upit.godina;
	let kolegij = upit.kolegij;
	
	// ... obično bi ovdje odredili koji je odgovor
	let odgovor = {
		upit, // vraćamo upit natrag, čisto za provjeru
		status: "uspješno"
	};

	res.json(odgovor);
	// res.send()
	// res.sendFile()	// res.download()
}

app.get("/student", studentHandler);
app.get("/student/:id", studentHandler)

app.get('/posts', (req, res) => {
	// console.log(storage.posts);
	let posts = storage.posts;
	let query = req.query;

	if (query.title) {
		// console.log(`Treba pretražiti po 'title' = ${query.title}`);
		posts = posts.filter(post => post.title.indexOf(query.title) >= 0);
	}
	if (query.createdBy) {
		posts = posts.filter(post => post.createdBy.indexOf(query.createdBy) >= 0);
	}

	if (query._any) {
		let pretraga = query._any;
		console.log(pretraga);
		let pojmovi = pretraga.split(" ");

		posts = posts.filter(post => {
			let podaci = post.title + post.createdBy;
			let rezultat = pojmovi.every(pojam => {
				return podaci.indexOf(pojam) >= 0
			})
			return rezultat;
		});
	}

	res.json(posts) // vraćaju se samo postovi koji odgovaraju upitu, vraćamo postove direktno koristeći `json` metodu
});

app.get('/kalkulator', (req, res) => {
	console.log(req.query);
	let query = req.query;
	let result = {
		sum: parseFloat(query.firstOperand) + parseFloat(query.secondOperand),
		difference: parseFloat(query.firstOperand) - parseFloat(query.secondOperand),
		product: parseFloat(query.firstOperand) * parseFloat(query.secondOperand),
		quotient: parseFloat(query.firstOperand) / parseFloat(query.secondOperand)
	};
	res.json(result)
});

app.get('/fibonacci', (req, res) => {
	console.log(req.query);
	let query = req.query;

	let fibonacci = [0, 1];
	for (let i = 2; i < query.numberK; i++) {
		fibonacci[i] = fibonacci[i-2] + fibonacci[i-1];
	}
	let rezultat = fibonacci[fibonacci.length-1];
	if (query.numberK === "1") rezultat = 0;

	console.log(fibonacci);
	let result = {
		fibonacciResult: rezultat
	};
	res.json(result);
});

app.get('/map-studenti', (req, res) => {
	console.log(storage.studenti);
	let result = storage.studenti.map(student => `${student.ime} ${student.prezime} (${student.oib})`);
	res.json(result);
});

app.get('/reduce-studenti', (req, res) => {
	console.log(storage.studenti);
	let result = storage.studenti.reduce((currentValue, student) => currentValue + student.ime.length, 0);
	res.json(result);
});

app.get('/reduce-a1', (req, res) => {
	console.log(storage.a1);
	let result = storage.a1.reduce((obj, name) => {
		obj[name] = obj[name] ? ++obj[name] : 1;
		return obj;
	}, {});
	res.json(result);
});

app.get('/reduce-lista', (req, res) => {
	console.log(storage.lista);
	let result = storage.lista.reduce((acc, val) => {
		return acc.id > val.id ? acc.id : val.id;
  });
	res.json(result);
});

app.listen(port, () => console.log(`Slušam na portu ${port}!`));
