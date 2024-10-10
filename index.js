const express = require('express')
const app = express()
const port = 3000

const botlib = require('./botlib.js');
var emitter = botlib.emitter
var router = botlib.router
//const { query } = require('./botlib.js');


////////////////// variables del bot //////////////////////////////
const source = '573143285974'
const botname = 'veseguro'
const boturlapi = "https://flowise-y3q2.onrender.com/api/v1/prediction/28e85d20-87ed-493d-8860-60241c9250e9"

//////////////////////////// base //////////////////////////////////////

app.use(function(req, res, next) {
    var data = '';
    req.setEncoding('utf8');
    req.on('data', function(chunk) {
        data += chunk;
    });
    req.on('end', function() {
        req.body = data;
        next();
    });
});

const cors = require('cors');

const app = express();
const corsOptions ={
   origin:'*', 
 }

app.use(cors(corsOptions)) // Use this after the variable declaration


app.use("/",router);




app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

///////////////////////////////////////////////////////////////////////////////////////////

//////////////////////// logica del bot //////////////////////////////////////////////////

/////////////// manejo de eventos /////////////////////
emitter.on('event', function(pregunta,vcontextobj){

	botlib.query({"question": pregunta},boturlapi).then((response) => {
		botlib.cargarRespuesta(response.text,vcontextobj)
	    // res.sendStatus(200);
	
	   console.log(response);
    });	 

    
}, {async: true});

emitter.on('pregunta', function(pregunta,vcontextobj){

	let vrespuesta = '{ "type":"quick_reply","msgid":"qr1","content":{ "type":"text", "text":"Confirma la transaccion?" },"options":[ { "type":"text", "title":"Confirma","postbackText": "Aaaaaaa" }, { "type":"text", "title":"Cancela","postbackText": "bbbbb" } ]}'

	let vresp1 ='{"type": "list","title": "title text","body": "body text","globalButtons": [{"type": "text","title": "button text"}],"items": [{"subtitle": "first Subtitle","options": [{"title": "section 1 row 1","description": "first row of first section desctiption"},{"title": "section 1 row 2","description": "second row of first section desctiption"}]},{"title": "second section","subtitle": "second Subtitle","options": [{"title": "section 2 row 1","description": "first row of second section desctiption"}]},{"title": "third Section","subtitle": "third Subtitle","options": [{"title": "section 3 row 1","description": "first row of third section desctiption"}]}]}'

	botlib.cargarRespuesta(["aaaaaaaaaaaaa",vrespuesta],vcontextobj)	
    
}, {async: true});

emitter.on('Confirma', function(pregunta,vcontextobj){

	let vrespuesta = ['respondio Confirma',"aaaaaaaaa","bbbbbbbbbbb"]
	botlib.cargarRespuesta(vrespuesta,vcontextobj)	
    
}, {async: true});

emitter.on('Cancela', function(pregunta,vcontextobj){

	let vrespuesta = 'respondio Cancela'
	botlib.cargarRespuesta(vrespuesta,vcontextobj)	
    
}, {async: true});

///////////////////////////////////////////////////////

