import { createClient } from 'redis';
import { promisify } from 'util';

const client = createClient();

client.on('error', err => {
  console.log('Redis client not connected to the server:', err.toString());
});

client.on('connect', () => {
  console.log('Redis client connected to the server');
});

const getAsync = promisify(client.GET).bind(client);

const setNewSchool = (schoolName, value) => {
  client.SET(schoolName, value, (err, reply) => {
    if (err) {
      console.error('Error:', err);
    } else {
      console.log('Reply:', reply);
    }
  });
};

const displaySchoolValue = async (schoolName) => {
  try {
    const reply = await getAsync(schoolName);
    console.log(reply);
  } catch (error) {
    console.error(error);
  }
};

displaySchoolValue('ALX');
setNewSchool('ALXSanFrancisco', '100');
displaySchoolValue('ALXSanFrancisco');
