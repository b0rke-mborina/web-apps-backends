// import express from 'express';
const express = require("express");
const routes = require("./routes");
const dodaj = require("./dodaj-route");
const dohvati = require("./dohvati-route");
const publicFolder = express.static('public');

const app = express();  // instanciranje aplikacije
const port = 3000;  // port na kojem će web server slušati

let studenti = [
	{
		JMBAG: "0000000000",
		ime: "Ivo",
		prezime: "Ivic",
		godinaStudija: 1
	},
	{
		JMBAG: "1111111111",
		ime: "Maja",
		prezime: "Majic",
		godinaStudija: 2
	},
	{
		JMBAG: "2222222222",
		ime: "Marko",
		prezime: "Ilic",
		godinaStudija: 3
	},
	{
		JMBAG: "3333333333",
		ime: "Ivana",
		prezime: "Horvat",
		godinaStudija: 4
	},
	{
		JMBAG: "4444444444",
		ime: "Lea",
		prezime: "Kovacic",
		godinaStudija: 5
	},
];

app.get('/datum', routes.datum);
app.get('/prognoza', routes.prognoza);
app.get('/', routes.home);

app.get('/dodaj', dodaj.dodaj);
app.get('/dohvati', dohvati.dohvati);

app.use('/datum-i-prognoza', publicFolder);

app.get('/studenti', (req, res) => {
	res.send(studenti);
});
app.get('/studenti/first', (req, res) => {
	res.send(studenti[0]);
});
app.get('/studenti/last', (req, res) => {
	res.send(studenti[studenti.length-1]);
});

app.listen(port, () => console.log(`Slušam na portu ${port}!`));
