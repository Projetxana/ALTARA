import handler from './api/ical-sync.js';
import { randomUUID } from 'crypto';

async function run() {
    const validChaletId = randomUUID(); // This generates a valid UUID format
    const req = {
        method: 'POST',
        body: {
            url: "https://fr.airbnb.ca/calendar/ical/1573357187276949817.ics?t=895b94834a674b418105108763db1623",
            chaletId: validChaletId,
            platform: 'airbnb'
        }
    };
    const res = {
        status: function(code) {
            console.log("STATUS:", code);
            return this;
        },
        json: function(data) {
            console.log("JSON:", JSON.stringify(data, null, 2));
        }
    };

    try {
        await handler(req, res);
    } catch(e) {
        console.error("HANDLER CRASHED:", e);
    }
}
run();
