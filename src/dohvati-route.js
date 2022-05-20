let lista = require("./lista");

let dohvati = (req, res) => {
	let str = lista.listaSlucajnihBrojeva.join(" ");
	res.send(str);
};

module.exports = { dohvati }