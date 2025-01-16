import kue from 'kue';
import jobs from './jobs_array';

const queue = kue.createQueue();

jobs.forEach((jobData) => {
  const job = queue.create('push_notification_code_2', jobData)
    .save((err) => {
      if (err) {
        console.error('Notification job creation failed:', err);
      } else {
        console.log(`Notification job created: ${job.id}`);
      }
    });

  job.on('complete', () => {
    console.log(`Notification job ${job.id} completed`);
  });

  job.on('failed', (err) => {
    console.log(`Notification job ${job.id} failed: ${err}`);
  });

  job.on('progress', (progress) => {
    console.log(`Notification job ${job.id} ${progress}% complete`);
  });
});
