import { createClient } from 'redis';

const client = createClient();

client.on('error', (err) => {
  console.log('Redis client not connected to the server:', err.toString());
});

client.on('connect', () => {
  console.log('Redis client connected to the server');
});

const hashFields = [
  'Portland', 50,
  'Seattle', 80,
  'New York', 20,
  'Bogota', 20,
  'Cali', 40,
  'Paris', 2,
];

client.HSET('ALX', hashFields, (err, reply) => {
  if (err) console.error(err);
  else console.log('Hash fields set:', reply);

  client.HGETALL('ALX', (err, reply) => {
    if (err) console.error(err);
    else console.log('Hash contents:', reply);
  });
});
