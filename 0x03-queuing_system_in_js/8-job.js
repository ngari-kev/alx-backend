import kue from 'kue';

/**
 * Creates push notification jobs in the queue.
 */
function createPushNotificationsJobs(jobs, queue) {
  if (!Array.isArray(jobs)) {
    throw new Error('Jobs is not an array');
  }

  jobs.forEach((jobData) => {
    const job = queue.create('push_notification_code_3', jobData);

    job
      .on('enqueue', () => {
        // Use a fallback for job.id if undefined
        const jobId = job.id || '(no id in test mode)';
        console.log(`Notification job created: ${jobId}`);
      })
      .on('complete', () => {
        console.log(`Notification job ${job.id || '(no id in test mode)'} completed`);
      })
      .on('failed', (err) => {
        console.log(`Notification job ${job.id || '(no id in test mode)'} failed: ${err}`);
      })
      .on('progress', (progress) => {
        console.log(`Notification job ${job.id || '(no id in test mode)'} ${progress}% complete`);
      });

    job.save();
  });
}

export default createPushNotificationsJobs;
