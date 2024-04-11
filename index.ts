import amqp from 'amqplib';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

async function getEvent() {
    const url = process.env.URL || "amqp://michi:michi123@52.205.249.137";
    const conn = await amqp.connect(url);
    const channel = await conn.createChannel();

    const exchange = 'Maikol';

    await channel.assertExchange(exchange, 'direct', {durable: true});

    const queueName = 'initial';
    const queue = await channel.assertQueue(queueName, {exclusive: false});
    await channel.bindQueue(queue.queue, exchange, '12345');

    console.log('Listening events of RabbitMQ');

    channel.consume(queue.queue, async(mensaje)=>{
        if(mensaje !== null){
            console.log(`Message received: ${mensaje}`);
            try {
                const id = Number(mensaje.content);
                const response = await axios.post('https://hexagonal-2.onrender.com/registrations',{mensaje});
                console.log(response);
            } catch (error) {
                console.log("Error sending to API");   
            }
        }
    }, {noAck:true});
}
getEvent().catch(console.error);