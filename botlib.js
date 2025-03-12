var express = require('express');
var router = express.Router();

const qs = require('qs');

var EventEmitter2 = require('eventemitter2');
var emitter= new EventEmitter2();
const dotenv = require('dotenv').config()

var {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNodeHttpEndpoint,
} = require('@copilotkit/runtime');
var OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const llmAdapter = new OpenAIAdapter({ openai });


////////////////// variables del bot //////////////////////////////
const source = '573143285974'
const botname = 'veseguro'
//const url_flowise = 'https://pre.serviciosia.transfiriendo.com:8080/api/v1/prediction/'
const url_flowise = 'https://flowise-y3q2.onrender.com/api/v1/prediction/'
var  idflow = '28e85d20-87ed-493d-8860-60241c9250e9'

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

const query_audio =async function(data,boturlapi) {
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

const getBlobFromBase64Data = function(base64Data, contentType, sliceSize = 512) {
    let byteCharacters;
    if (typeof window !== "undefined") {
      // Client-side
      byteCharacters = atob(base64Data);
    } else {
      // Node.js
      byteCharacters = Buffer.from(base64Data, "base64").toString("binary");
    }
  
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
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

      let categoria

      console.log(vcontextobj)
      console.log(vsenderobj)
      console.log(vpregunta)
      console.log(resp_men)

           // ojo debo llamar a rutina que me entrega los datos personales, yo le paso el telefono

      if (resp_men.payload.type ==='text') {      
      
        var vpregunta = resp_men.payload.payload.text
		
		if (vpregunta.includes("**activa")) {
			idflow = vpregunta.replace("**activa ", "");
			cargarRespuesta('Cambie a workflow :'+idflow,vcontextobj)
		} else {
			//query({"question": vpregunta,"overrideConfig": {"sessionId": resp_men.payload.sender.phone,"systemMessage":"You are a helpful AI assistant.  debes tener un trato amable y personalizado utilizando los datos personales. tienes que tener en tu contesto  mis  datos personales::  nombre: Carlos, email: ccabreraq@gmail.com, celular: 573204903664, dud: cccc,identificador 34567 debes usar estos datos cuando los necesites"}},process.env.FLOW_INICIAL).then((response) => {
			query({"question": vpregunta,"overrideConfig": {"sessionId":sessionId,"systemMessage":"You are a helpful AI assistant.  debes tener un trato amable y personalizado utilizando los datos personales. tienes que tener en tu contesto  mis  datos personales::  nombre: Carlos, email: ccabreraq@gmail.com, celular: 573204903664, dud: cccc,identificador 34567 debes usar estos datos cuando los necesites"}},url_flowise+idflow).then((response) => {
				cargarRespuesta(response.text,vcontextobj)
			console.log(response);
			});	
		}		


      }  else if (resp_men.payload.type ==='audio') {  

        let audio_url = resp_men.payload.payload.url
        let audio_contentType = resp_men.payload.payload.contentType

        let audio_url1 = audio_url.replace("?download=false", "");

        async function fetchBlob(url) {
            const response = await fetch(url);
            const blob = await response.arrayBuffer();

            const base_ori = await Buffer.from(blob).toString("base64")

            const fconver = await getBlobFromBase64Data(base_ori, 'wav',512)
            let data_audio = await `data:audio/webm;base64,${base_ori}`;
            //let data_audio = await `data:audio/webm;base64,${Buffer.from(fconver).toString("base64")}`;
            console.log(data_audio);

            //let data_audio = await `data:${response.headers.get("content-type")};base64,${Buffer.from(blob).toString("base64")}`;
            //console.log(data_audio);

            query_audio({
                "uploads": [
                    {
                        "data": data_audio, //base64 string
                        "type": 'audio',
                        "name": 'audio.wav',
                        "mime": 'audio/webm'
                    }
                ]
            },url_flowise+idflow).then((response_audio) => {
                console.log(response_audio);
                cargarRespuesta(response_audio.text,vcontextobj)
            });    
        
        }

        fetchBlob(audio_url1)


      }  else if (resp_men.payload.type ==='image') {

        let image_url = resp_men.payload.payload.url
        let image_contentType = resp_men.payload.payload.contentType
        let image_texto = resp_men.payload.payload.caption

        let image_url1 = image_url.replace("?download=false", "");

        async function fetchBlob(url) {
            const response = await fetch(url);
            const blob1 = await response.arrayBuffer();
            let data_image = await `data:${response.headers.get("content-type")};base64,${Buffer.from(blob1).toString("base64")}`;
            console.log(data_image);

            query_audio({
                "question": image_texto,
                "uploads": [
                    {
                        "data": data_image, //base64 string
                        "type": 'file',
                        "name": 'Flowise.jpg',
                        "mime": image_contentType
                    }
                ]
                },url_flowise+idflow).then((response_image) => {
                console.log(response_image);
                cargarRespuesta(response_image.text,vcontextobj)
            }); 
		}

        fetchBlob(image_url1)
		
        
       }  else if (resp_men.payload.type ==='file') {

        let file_url = resp_men.payload.payload.url
        let file_contentType = resp_men.payload.payload.contentType
        let file_texto = resp_men.payload.payload.caption
        let file_name = resp_men.payload.payload.name

        //let file_url1 = file_url.replace("?download=false", "");

        async function fetchBlob(url) {
            const response = await fetch(url);
            const blob2 = await response.arrayBuffer();
			
			///////////////// convierte archivo en texto ///////////////////////////
			
			const formData = new FormData();
			formData.append("files", Buffer.from(blob2));

			const response_file1 = await fetch('https://flowise-y3q2.onrender.com/api/v1/attachments/'+idflow+'/'+sessionId+"'", {
				method: 'POST',
				headers: {				  
				  "Content-Type": "multipart/form-data"
				},
				body: formData
			});
			let data_file = await response_file1.json();
			
			////////////////////////////////////////////////////////////////////////
			
            //let data_file = await `data:${response.headers.get("content-type")};base64,${Buffer.from(blob2).toString("base64")}`;
            console.log(data_file);

            query_audio({
                "question": file_texto,
				"chatId": sessionId,
                "uploads": [
                    {
                        "data": data_file, //base64 string
                        "type": 'file:full',
                        "name": file_name,
                        "mime": file_contentType
                    }
                ]
                },url_flowise+idflow).then((response_file) => {
                console.log(response_file);
                cargarRespuesta(response_file.text,vcontextobj)
            });    
        
       }

        fetchBlob(file_url)


      }

    }  else { 
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
   
    clasifica({"messages": [{"content": pregunta}],"uid":"aaa","datos_personales":resp_men.datos_personales }).then((response) => {
        console.log(response)
        // saca url
        if (response === "no_permitido" || response == null) {
               res.status(200).send("no puedo hablar de esos temas") 	
        } else {
            let def_url = response.split("|");
            //query({"question": pregunta,"overrideConfig": {"sessionId": sessionId}},boturlapi1).then((response) => {
            query({"question": pregunta,"overrideConfig":{"sessionId": sessionId,"qdrantCollection":{"qdrant_0":"axa"},"systemMessage":"You are a helpful AI assistant.  debes tener un trato amable y personalizado utilizando los datos personales. tienes que tener en tu contesto  mis  datos personales:  nombre: Carlos, email: ccabreraq@gmail.com, celular: 573204903664, dud: cccc,identificador 34567 debes usar estos datos cuando los necesites"}},def_url[1]).then((response1) => {
                res.status(200).send(response1) 	
            console.log(response1);
            });	 

              

        
        }
            
        //res.status(200).send(response) 	
        //console.log(response);
    });	 

})

router.post('/copilotkit', (req, res, next) => {
  const runtime = new CopilotRuntime();
  const handler = copilotRuntimeNodeHttpEndpoint({
    endpoint: '/copilotkit',
    runtime,
    llmAdapter,
  });
 
  return handler(req, res, next);
});


//////////////////////////////////////////////////////////////

module.exports = {router,emitter,query,cargarRespuesta};
/////////////////////////////////////////////////////////////////
