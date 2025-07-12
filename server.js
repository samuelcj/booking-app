// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

const app = express();
const port = 3000;

const REGION = "us-east-1"; // replace with your region
const s3 = new S3Client({ region: REGION });
const ses = new SESClient({ region: REGION });

const BUCKET_NAME = "<YOUR BUCKET NAME>"; // replace with your actual bucket
const TO_EMAIL = "<YOUR VERIFIED SES EMAIL>";  // must be verified in SES (sandbox mode)
const FROM_EMAIL = "<YOUR VERIFIED SES EMAIL>"; // must be verified

app.use(cors());
app.use(bodyParser.json());

app.post("/book", async (req, res) => {
  const booking = req.body;
  const key = `bookings/${Date.now()}-${booking.email}.json`;

  try {
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: JSON.stringify(booking),
      ContentType: "application/json"
    }));

    await ses.send(new SendEmailCommand({
      Destination: { ToAddresses: [TO_EMAIL] },
      Message: {
        Subject: { Data: "New Booking Notification" },
        Body: {
          Text: {
            Data: `New booking received:\n\nName: ${booking.name}\nEmail: ${booking.email}\nDate: ${booking.date}\nTime: ${booking.startTime}\nDuration: ${booking.duration} minutes`
          }
        }
      },
      Source: FROM_EMAIL
    }));

    res.json({ success: true, time: `${booking.date} at ${booking.startTime}` });
  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({ error: "Booking failed" });
  }
});

app.listen(port, () => {
  console.log(`Booking app running on port ${port}`);
});
