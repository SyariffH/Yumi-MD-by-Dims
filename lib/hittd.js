const fs = require('fs')

const ceemdetd = JSON.parse(fs.readFileSync('./db/todaycmd.json'))

/**
 * for add total command
 * @params {direktori} 
 * dah lah
**/
const cmdaddtd = () => {
	ceemdetd[0].todaycmd += 1
	fs.writeFileSync('./db/todaycmd.json', JSON.stringify(ceemdetd))
}

module.exports = {
	cmdaddtd
}