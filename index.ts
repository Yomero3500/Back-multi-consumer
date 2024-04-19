import amqp from 'amqplib';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

async function getEvent() {
    const url = process.env.URL || "amqp://guest:guest@34.232.159.80";
    const conn = await amqp.connect(url);
    const channel = await conn.createChannel();

    const exchange = 'amq.topic';

    await channel.assertExchange(exchange, 'topic', {durable: true});

    const queueName = 'cola';
    const queue = await channel.assertQueue(queueName, {exclusive: false});
    await channel.bindQueue(queue.queue, exchange, '12345');

    console.log('Listening events of RabbitMQ');

    channel.consume(queue.queue, async(mensaje)=>{
        if(mensaje !== null){
            console.log(`Message received: ${mensaje.content}`);
            try {
                const data = JSON.parse(mensaje.content.toString());
                console.log(data);
                const Vrms = {tipo:"Vrms", valor: data.Vrms, correo_cliente: "jrmoch2@gmail.com"  }
                const response = await axios.post('https://back-multi-secundaria.onrender.com/lectura',{tipo:"Vrms", valor: data.Vrms, correo_cliente:"jrmoch2@gmail.com"});
                const response1 = await axios.post('https://back-multi-secundaria.onrender.com/lectura',{tipo:"Irms", valor: data.Irms, correo_cliente:"jrmoch2@gmail.com"});
                const response2 = await axios.post('https://back-multi-secundaria.onrender.com/lectura',{tipo:"Power", valor: data.Power, correo_cliente:"jrmoch2@gmail.com"});
                const response3 = await axios.post('https://back-multi-secundaria.onrender.com/lectura',{tipo:"kWh", valor: data.kWh, correo_cliente:"jrmoch2@gmail.com"});               
            } catch (error) {
                console.log("Error sending to API:", error);   
            }
        }
    }, {noAck:false});
}
getEvent().catch(console.error);