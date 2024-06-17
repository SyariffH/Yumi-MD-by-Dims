/**
  * Dibuat oleh SSA Team
  * Wm jangan di hpus yh
  *
  * "Janganlah engkau menjual sesuatu yang bukan milikmu" (HR. Abu Dawud).
  * Hal ini sesuai dengan firman Allah SWT dalam Surat Al Baqarah ayat 275 yang artinya:” … Dan Allah telah menghalalkan jual beli dan mengharamkan riba… ( Q.S. al-Baqarah: 275).
**/

const fs = require('fs')
const { color } = require('./lib/myfunc')

/** owner **/
global.owner = ['6281398274790']
global.nomerowner = '6281398274790'

/** settings bot **/
global.botname = 'Yumi'
global.wm = 'Powered By Yumi'

/** sticker packname **/
global.packname = 'Yumi'
global.author = '© Dims'

/** option sosial media **/  
global.media = {
  sig: 'https://instagram.com/dims_t11',
  syt: 'https://www.youtube.com/@Dims_senpai',
  sgh: 'https://github.com/Im-Dims',
  sch: 'https://whatsapp.com/channel/0029VaDs0ba1SWtAQnMvZb0U',
  sr: 'https://replit.com/@DimasTriyatno',
  swa: 'https://wa.me/6281398274790'
}

/** settings thumbail and newsletterJid **/
global.newsletter = '120363193509141242@newsletter'
global.thumb = 'https://telegra.ph/file/c64b1a4f5b6c41c3fa766.jpg'
global.png = fs.readFileSync('./yumi.png')
global.vid = fs.readFileSync('./lib/yumi.mp4')

/** database mongo **/
global.urldb = ''; // kosongin aja tapi kalo mau pake database mongo db isi url mongo

/** function, scraper, and tools to make it more practical **/
global.Func = new (require('./lib/functions'))
global.scrap = new (require('./lib/scrape'))

/** message **/
global.mess = {
  success: 'Done desu~',
  admin: '_*Perintah Ini Hanya Bisa Digunakan Oleh Admin Group !*_',
  botAdmin: '_*Perintah Ini Hanya Bisa Digunakan Ketika Bot Menjadi Admin Group !*_',
  owner: '_*Perintah Ini Hanya Bisa Digunakan Oleh Owner !*_',
  group: '_*Perintah Ini Hanya Bisa Digunakan Di Group Chat !*_',
  private: '_*Perintah Ini Hanya Bisa Digunakan Di Private Chat !*_',
  wait: '_*⏳ Sedang Di Proses !*_',
}

/** realod file **/
let file = require.resolve(__filename)
fs.watchFile(file, () => {
  fs.unwatchFile(file)
  console.log(color(`Update'${__filename}'`))
  delete require.cache[file]
  require(file)
})