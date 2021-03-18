//:TODO put this in database and a endpoint for the link list page
const csv = require('csv-parser');
const fs = require('fs');
function writeToJSONFile(codes) {
    const filename = 'resources/kommunlankod.json';
    let handle = fs.writeFile(filename, codes, err => {
        if (err) {
            console.log('Error writing to json file', err);
        } else {
            console.log(`saved as ${filename}`);
        }
    });
}

const csvToJson = ()  => {
    const results = [];
    fs.createReadStream('resources/kommunlankod.csv')
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            writeToJSONFile(JSON.stringify(results));
        });
};

(async function() {
     csvToJson();
})();