const mongo = require("mongodb").MongoClient;

let connection_string = "ThisIsAFakeConnectionString";

let client = new mongo(connection_string, {
	useNewUrlParser: true,
	useUnifiedTopology: true
});

/*client.connect(err => {
	if (err) {
		console.error(err);
		return;
	}
	console.log("Database connected successfully!");

	// za sada ništa nećemo raditi, samo zatvaramo pristup sljedećom naredbom
	client.close();
});*/

let db = null

// eksportamo Promise koji resolva na konekciju
module.exports = () => {
	return new Promise((resolve, reject) => {
		// ako smo inicijalizirali bazu i klijent je još uvijek spojen
		// if (db && client.isConnected()) {
			// resolve(db)
		// }
		// else {
			client.connect(err => {
				if (err) {
					reject("Spajanje na bazu nije uspjelo:" + err);
				}
				else {
					console.log("Database connected successfully!");
					db = client.db("fipugram");
					resolve(db);
				}
			});
		// }
	});
}