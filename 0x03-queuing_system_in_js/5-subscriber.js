import { createClient } from 'redis';

const client = createClient();

client.on('error', (err) => {
  console.log('Redis client not connected to the server:', err.message);
});

client.on('connect', () => {
  console.log('Redis client connected to the server');
});

client.subscribe('ALXchannel');

client.on('message', (channel, message) => {
  console.log(`Received message: ${message} on channel: ${channel}`);
  if (message === 'KILL_SERVER') {
    console.log('Unsubscribing and quitting the client...');
    client.unsubscribe();
    client.quit();
  }
});
