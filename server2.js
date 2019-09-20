/*Tom Murphy*/

var fs = require("fs");
var qs = require("querystring");
var http = require("http");
var path = require("path");

var port = 8000;
var public_dir = path.join(__dirname, "public");
//var membersFile; // then read file, once done, set members = modified version, this is the path

const fileType = {
	'.html': 'text/html',
	'.js': 'text/javascript',
	'.css': 'text/css',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.json': 'application/json'
};

let joinPath = path.join(__dirname, 'public', 'join.html');
let readableStream = fs.createReadStream(joinPath);


function NewRequest(req, res) {
	var filename = req.url.substring(1);
	if (filename === "") {
		filename = "index.html";
	}
	//var fullpath = path.join(public_dir, filename);

	if (req.method === 'GET') {
		HandleGetRequest(filename, req, res);
	}
	else {
		HandlePostRequest(filename, req, res);
	}
}


function HandleGetRequest(filename, req, res) {
	var fullpath = path.join(public_dir, filename);

	var extension = path.extname(fullpath);
	fs.readFile(fullpath, (err, data) => {
		if (err) {
			res.writeHead(404, {
				'Content-Type': 'text/plain'
			});
			res.write("Oh no! Could not find file");
			res.end();
		}
		else {
			res.writeHead(200, {
				'Content-Type': fileType[extension]
			});
			res.write(data);
			res.end();
		}
	});
}


function HandlePostRequest(filename, req, res) {
	if (req.method === "POST") {

		let body = "";
		req.on("data", chunk => {
			body += chunk.toString(); // convert binary buffer to string
		});

		req.on("end", () => {
			let joinPath = path.join(public_dir, "join.html");

			console.log(body);
			let query = qs.parse(body);

			let membersFile = {
				"fname": query.fname,
				"lname": query.lname,
				"gender": query.gender[0],
				"birthday": query.birthday
			};
			var members = new Object();
			members[query.email] = membersFile;
			var memberString = JSON.stringify(members, null, 4);
			fs.writeFile(path.join(public_dir, "data", "members.json"), memberString, (err) => {
				if (err) {
					console.log("Error writting members file");
				}
			});

			fs.readFile(joinPath, (err, data) => {

				if (err) {
					res.writeHead(404, {
						"Content-Type": "text/plain"
					});
					res.write("Oh no! Could not find file");
					res.end();
				}
				else {
					res.writeHead(200, {
						"Content-Type": "text/html"
					});
					res.write(data);
					res.end();
				}
			})
		});
	};
}


var server = http.createServer(NewRequest);

console.log("Now listening on port " + port);
server.listen(port, "0.0.0.0");

