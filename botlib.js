var express = require('express');
var router = express.Router();

const qs = require('qs');

var EventEmitter2 = require('eventemitter2');
var emitter= new EventEmitter2();
const dotenv = require('dotenv').config()

////////////////// variables del bot //////////////////////////////
const source = '573143285974'
const botname = 'veseguro'

const url_clasifica = "https://semantic-router.onrender.com/semantic-router"

const sessionId = 'c8'


///////////////////funciones//////////////////////////////

const cargarRespuesta = async function(response,vcontextobj) {

	///// verifica si es un mensaje complejo
	let sicomando = true
	let respuesta1 = ""
    let data
    let resp
    let respuestas = []

    if (typeof response === "string"){
       respuestas[0] = response
    } else {
        respuestas = response
    }

    for (const key of respuestas) {
         try {
            let parsedData = JSON.parse(key);
            // aca viene la rutina de clasificar el mensaje y convertirlo en el mensaje correspondiente
            console.log(parsedData);
            respuesta1 = key	
        } catch (error) {
            sicomando = false
            respuesta1 = key
        }

        if (sicomando) {

        }

        console.log(respuesta1)
            
        data = qs.stringify({
            'channel': 'whatsapp',
            'source': source,
            'destination': vcontextobj.phone,
            'message': respuesta1,
            'src.name': botname
        })

 
        // 'message': '{ "type":"quick_reply","msgid":"qr1","content":{ "type":"text", "text":"confirma que hace la transaccion?" },"options":[ { "type":"text", "title":"Confirma" }, { "type":"text", "title":"Cancela" } ]}',

        resp = await fetch("https://api.gupshup.io/wa/api/v1/msg", {
        method: "POST",
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'apikey': process.env.GUPSHUP_APIKEY},
        body: data,
        });
        
        if(resp.ok){ 

            const datos = await resp.json();
            console.log(datos);
        } else {
            console.log(resp.status); // 404
            //res.sendStatus(status)
        }
    }

}

const query =async function(data,boturlapi) {
//async function query(data,boturlapi) {
	// dependiendo de la categria se sabe la url que hay que llamar, ya sea porque la rutina la devuelve o porque lo averigua aca (boturl)
    const response = await fetch(boturlapi,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        }
    );
    const result = await response.json();
    return result;
}

const clasifica =async function(data) {
    //async function query(data,boturlapi) {
        // dependiendo de la categria se sabe la url que hay que llamar, ya sea porque la rutina la devuelve o porque lo averigua aca (boturl)
        const response = await fetch(url_clasifica,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            }
        );
        const result = await response.json();
        return result;
    }
    
////////////////////////////////////////////////////////
///////////// metodos api ////////////////////////////

router.post('/modo_whatsapp_v2', function(req, res) {
	
    var resp_men = JSON.parse(req.body)
    console.log("whatsapp_v2---------------------------------------------------------------")
    //console.log(resp_men)	
    


    if (resp_men.type ===	"message") {
        

      var vcontextobj = {botname: "AAAA",channeltype: "whatsapp",phone:resp_men.payload.sender.phone,contextid: "whatsapp:"+resp_men.payload.sender.phone,contexttype: "p2p"}
      var vsenderobj = {channelid:"whatsapp:"+resp_men.payload.sender.phone+'"',channeltype:'whatsapp',display:resp_men.payload.sender.name}
      var vmessageobj =  {text:resp_men.payload.payload.text,type:'msg'}
      var vpregunta = resp_men.payload.payload.text
      var vtipo = resp_men.payload.type
      var dusuario_estado = "visitante";

      let categoria

      console.log(vcontextobj)
      console.log(vsenderobj)
      console.log(vpregunta)
      console.log(resp_men)

      // paso la pregunta al clasificador contextual y devuelvo una categoria // tener en cuanta que si lo que recibo del cliente es una pregunta o una respuesta a una pregunta que hace el bot
      // devuelvo la api a llamr o el metodo a llamar y lo entrego a la rutina de pregunta
      if (vtipo === 'button_reply'){
         categoria = resp_men.payload.payload.title
      } else {
       if (vpregunta === 'pregunta'){
           categoria = "pregunta"
       } else {
           categoria = "event"
       }
      }

      emitter.emit(categoria, vpregunta,vcontextobj);

      
    } else { 
        //	res.sendStatus(200);
       console.log("-------------------------------") 
       console.log(resp_men)	
    }

    //res.sendStatus(200);
    res.status(200).send("") 
   
});

router.post('/modo_whatsapp_v3', function(req, res) {
	
    var resp_men = JSON.parse(req.body)
    console.log("whatsapp_v3---------------------------------------------------------------")
    //console.log(resp_men)	
    


    if (resp_men.type ===	"message") {
        

      var vcontextobj = {botname: "AAAA",channeltype: "whatsapp",phone:resp_men.payload.sender.phone,contextid: "whatsapp:"+resp_men.payload.sender.phone,contexttype: "p2p"}
      var vsenderobj = {channelid:"whatsapp:"+resp_men.payload.sender.phone+'"',channeltype:'whatsapp',display:resp_men.payload.sender.name}
      var vmessageobj =  {text:resp_men.payload.payload.text,type:'msg'}
      var vpregunta = resp_men.payload.payload.text
      var vtipo = resp_men.payload.type
      var dusuario_estado = "visitante";

      let categoria

      console.log(vcontextobj)
      console.log(vsenderobj)
      console.log(vpregunta)
      console.log(resp_men)

           // ojo debo llamar a rutina que me entrega los datos personales, yo le paso el telefono
      
    query({"question": vpregunta,"overrideConfig": {"sessionId": "dbdbdbd","systemMessage":"You are a helpful AI assistant.  debes tener un trato amable y personalizado. tienes que tener en tu contesto  mis  datos personales::  nombre: Carlos, email: ccabreraq@gmail.com, celular: 573204903664, dud: cccc,identificador 34567 debes usar estos datos cuando los necesites"}},process.env.FLOW_INICIAL).then((response) => {
	    cargarRespuesta(response.text,vcontextobj)
	   console.log(response);
    });	 


      
    } else { 
       //console.log(resp_men)	
    }

    //res.sendStatus(200);
    res.status(200).send("") 
   
});

router.post('/orquestador', function(req, res) {
	
    var resp_men = JSON.parse(req.body)
    console.log("orquestador______________________________________")
     console.log(resp_men)	
    let pregunta = resp_men.messages[0].content

    // paso la pregunta al clasificador contextual y devuelvo una categoria // tener en cuanta que si lo que recibo del cliente es una pregunta o una respuesta a una pregunta que hace el bot
    // devuelvo la api a llamr o el metodo a llamar y lo entrego a la rutina de pregunta
   
    clasifica({"messages": [{"content": pregunta}],"uid":"aaa" }).then((response) => {
        console.log(response)
        // saca url
        if (response === "no_permitido" || response == null) {
               res.status(200).send("no puedo hablar de esos temas") 	
        } else {
            let def_url = response.split("|");
            //query({"question": pregunta,"overrideConfig": {"sessionId": sessionId}},boturlapi1).then((response) => {
            query({"question": pregunta,"overrideConfig":{"qdrantCollection":{"qdrant_0":"axa"},"systemMessage":"You are a helpful AI assistant.  debes tener un trato amable y personalizado. tienes que tener en tu contesto  mis  datos personales::  nombre: Carlos, email: ccabreraq@gmail.com, celular: 573204903664, dud: cccc,identificador 34567 debes usar estos datos cuando los necesites"}},def_url[1]).then((response1) => {
                res.status(200).send(response1) 	
            console.log(response1);
            });	 

              

        
        }
            
        //res.status(200).send(response) 	
        //console.log(response);
    });	 

})




//////////////////////////////////////////////////////////////

module.exports = {router,emitter,query,cargarRespuesta};
/////////////////////////////////////////////////////////////////
