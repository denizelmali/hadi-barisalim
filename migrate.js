require('dotenv').config();
const mongoose = require('mongoose');

const letterSchema = new mongoose.Schema({
  trackingId: String,
  status: String,
  sentAt: Date,
  readAt: Date
});
const Letter = mongoose.models.Letter || mongoose.model("Letter", letterSchema);

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const data = require('./data/letters.json');
  for (const [id, info] of Object.entries(data)) {
    await Letter.updateOne(
      { trackingId: id },
      { $set: { status: info.status, sentAt: info.sentAt, readAt: info.readAt } },
      { upsert: true }
    );
    console.log('Migrated:', id);
  }
  console.log('Done');
  process.exit(0);
}).catch(console.error);
