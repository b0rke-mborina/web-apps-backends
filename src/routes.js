let datum = (req, res) => {
	let today = new Date();
	let day = today.getDate();
	let month = today.getMonth()+1;
	let year = today.getFullYear();
	let hours = today.getHours();
	let minutes = JSON.stringify(today.getMinutes()).padStart(2, '0');
	let date = day+"."+month+"."+year+". "+hours+":"+minutes;
	res.send(date);
};
let prognoza = (req, res) => {
	let weather = ["suncano", "kišovito", "oblacno"];
	let randomNumber = Math.floor(Math.random() * 3);
	res.send('Danas ce biti ' + weather[randomNumber]);
};
let home = (req, res) => {
	res.send("Ruta imena datum se nalazi na adresi /datum, a ruta imena /prognoza na adresi prognoza.");
};
module.exports = { datum, prognoza, home }