let lista = require("./lista");

let dodaj = (req, res) => {
	let slucajniBroj = Math.floor(Math.random() * 100);
	lista.listaSlucajnihBrojeva.push(slucajniBroj);
	res.send("U listu je dodan broj: " + slucajniBroj);
};

module.exports = { dodaj }