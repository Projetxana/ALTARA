import handler from './api/ical-sync.js';

async function run() {
    const req = {
        method: 'POST',
        body: {
            url: "https://fr.airbnb.ca/calendar/ical/1573357187276949817.ics?t=895b94834a674b418105108763db1623",
            chaletId: 'test-chalet',
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
