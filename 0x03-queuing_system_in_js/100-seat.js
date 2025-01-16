
import express from 'express';
import redis from 'redis';
import kue from 'kue';
import { promisify } from 'util';

const app = express();
const port = 1245;

const client = redis.createClient();

const queue = kue.createQueue();

client.on('error', (err) => {
    console.error(`Error: ${err}`);
});

const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);

const seatsAvailable = 50;
let reservable = true;

const reserveSeat = async (number) => {
    await setAsync('available_seats', number);
};

const getCurrentAvailableSeats = async () => {
    const value = await getAsync('available_seats');
    return value ? parseInt(value, 10) : 0;
};

(async () => {
    await reserveSeat(seatsAvailable);
})();

app.get('/available_seats', async (_, res) => {
    const availableSeats = await getCurrentAvailableSeats();
    res.json({ numberOfAvailableSeats: availableSeats.toString() });
});

app.get('/reserve_seat', async (req, res) => {
    if (!reservable) {
        return res.json({ status: "Reservations are blocked" });
    }

    const job = queue.create('reserve_seat', {}).save((err) => {
        if (!err) {
            return res.json({ status: "Reservation in process" });
        } else {
            return res.json({ status: "Reservation failed" });
        }
    });
});

queue.process('reserve_seat', async (job, done) => {
    try {
        const currentSeats = await getCurrentAvailableSeats();
        if (currentSeats > 0) {
            await reserveSeat(currentSeats - 1);
            done();
        } else {
            reservable = false;
            done(new Error('Not enough seats available')); // Job failed
        }
    } catch (err) {
        done(err);
    }
});

queue.on('job finished', (job) => {
    console.log(`Seat reservation job ${job.id} completed`);
});

queue.on('job failed', (job, err) => {
    console.log(`Seat reservation job ${job.id} failed: ${err.message}`);
});

app.get('/process', async (_, res) => {
    res.json({ status: "Queue processing" });
    queue.process();
});

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
