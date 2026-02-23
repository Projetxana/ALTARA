const axios = require('axios');
const url = "https://fr.airbnb.ca/calendar/ical/1573357187276949817.ics?t=895b94834a674b418105108763db1623";

async function run() {
    try {
        const res = await axios.get(url, {
             headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        console.log("Success fetching iCal", res.data.substring(0, 100));
    } catch(e) {
        console.error("Error", e.message);
    }
}
run();
