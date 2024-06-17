/**
  * Dibuat oleh SSA Team
  * Wm jangan di hpus yh
  *
  * "Janganlah engkau menjual sesuatu yang bukan milikmu" (HR. Abu Dawud).
  * Hal ini sesuai dengan firman Allah SWT dalam Surat Al Baqarah ayat 275 yang artinya:” … Dan Allah telah menghalalkan jual beli dan mengharamkan riba… ( Q.S. al-Baqarah: 275).
**/

require('./config') 

const { modul } = require('./module');
const { baileys, Utils, keyeddb, axios, ffmpeg, translate, PhoneNumber, cfonts, chalk, CheckDiskSpace, cheerio, child, crypto, figlet, FileType, FluentFfmpeg, FormData, fs, FsExtra, g4f, HumanReadable, jimp, lodash, lolcatjs, MimeTypes, moment, mongoose, fetch, NodeOsUtils, webpmux, ocr, os, path, hooks, PerformanceNow, pino, steno, SyntaxError, yargs } = modul;
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, makeInMemoryStore, jidDecode, proto, getContentType, downloadContentFromMessage, fetchLatestWaWebVersion, jidNormalizedUser, generateWAMessageFromContent, prepareWAMessageMedia, PHONENUMBER_MCC } = baileys;
const _ = require('lodash');
const readline = require("readline");
const { Boom } = require('@hapi/boom');
const NodeCache = require("node-cache");
const { Low, JSONFile } = require('./lib/lowdb');
const { uncache, nocache } = require('./lib/loader');
const { smsg, color, getBuffer } = require("./lib/myfunc");
const { toAudio, toPTT, toVideo } = require('./lib/converter');
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./lib/exif');
const store = makeInMemoryStore({ logger: pino().child({ level: "silent", stream: "store" }) });

global.db = new Low(new JSONFile('database.json'))
global.DATABASE = global.db
global.loadDatabase = async function loadDatabase() {
  if (global.db.READ) return new Promise((resolve) => setInterval(function () { (!global.db.READ ? (clearInterval(this), resolve(global.db.data == null ? global.loadDatabase() : global.db.data)) : null) }, 1 * 1000))
  if (global.db.data !== null) return
  global.db.READ = true
  await global.db.read()
  global.db.READ = false
  global.db.data = {
    users: {},
    chats: {},
    game: {},
    settings: {},
    ...(global.db.data || {})
  }
  global.db.chain = _.chain(global.db.data)
}
loadDatabase()

if (global.db) setInterval(async () => {
if (global.db.data) await global.db.write()
}, 30 * 1000)

function createTmpFolder() {
const folderName = "tmp";
const folderPath = path.join(__dirname, folderName);
if (!fs.existsSync(folderPath)) {
fs.mkdirSync(folderPath);
lolcatjs.fromString(`Folder '${folderName}' berhasil dibuat.`);
} else {
lolcatjs.fromString(`Folder '${folderName}' sudah ada.`);
}
}
createTmpFolder();

const question = (text) => {
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
return new Promise((resolve) => {
  rl.question(text, resolve)
  })
};

/** ketika di start langsung keluar nama di consol **/
const { say } = cfonts
say('Yumi', { font: 'chrome', align: 'center', gradient: ['blue', 'magenta'] })

function title() {
console.clear()
console.log(chalk.yellow(`${chalk.bold.yellow(`[ Yumi ]`)}\n\n`))
console.log(color(`< ========================== >`, 'cyan'))
console.log(color(`\nPowered By Im-Dims`, 'magenta'))
}

const phoneNumber = global.owner
const pairingCode = !!phoneNumber || process.argv.includes("--pairing")
const useMobile = process.argv.includes("--mobile")

async function startBotz() {
    const { version, isLatest } = await fetchLatestBaileysVersion();
    const { state, saveCreds } = await useMultiFileAuthState(`./sessions`);
    const msgRetryCounterCache = new NodeCache();
    const dims = makeWASocket({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: !pairingCode, // popping up QR in terminal log
        browser: ['Mac OS', 'chrome', '121.0.6167.159'], // for this issues https://github.com/WhiskeySockets/Baileys/issues/328
        patchMessageBeforeSending: (message) => {
            const requiresPatch = !!(
                message.buttonsMessage ||
                message.templateMessage ||
                message.listMessage
            );
            if (requiresPatch) {
                message = {
                    viewOnceMessage: {
                        message: {
                            messageContextInfo: {
                                deviceListMetadataVersion: 2,
                                deviceListMetadata: {},
                            },
                            ...message,
                        },
                    },
                };
            }
            return message;
        },
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
        },
        markOnlineOnConnect: true, // set false for offline
        generateHighQualityLinkPreview: true, // make high preview link
        getMessage: async (key) => {
            if (store) {
                const msg = await store.loadMessage(key.remoteJid, key.id);
                return msg.message || undefined;
            }
            return {
                conversation: "Cheems Bot Here!"
            };
        },
        msgRetryCounterCache, // Resolve waiting messages
        defaultQueryTimeoutMs: undefined, // for this issues https://github.com/WhiskeySockets/Baileys/issues/276
    });

    store.bind(dims.ev);

    if (pairingCode && !dims.authState.creds.registered) {
        if (useMobile) throw new Error('Cannot use pairing code with mobile api');

        let phoneNumber;
        if (!!phoneNumber) {
            phoneNumber = phoneNumber.replace(/[^0-9]/g, '');

            if (!Object.keys(PHONENUMBER_MCC).some(v => phoneNumber.startsWith(v))) {
                console.log(chalk.bgBlack(chalk.redBright("Start with country code of your whatsapp number, Example: +62xxx")));
                process.exit(0);
            }
        } else {
            phoneNumber = await question(chalk.bgBlack(chalk.greenBright("Please type your whatsapp number, For example: +62xxx : ")));
            phoneNumber = phoneNumber.replace(/[^0-9]/g, '');

            if (!Object.keys(PHONENUMBER_MCC).some(v => phoneNumber.startsWith(v))) {
                console.log(chalk.bgBlack(chalk.redBright("Start with country code of your whatsapp number, Example: +62xxx")));

                phoneNumber = await question(chalk.bgBlack(chalk.greenBright("Please type your whatsapp number, For example: +62xxx : ")));
                phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
                rl.close();
            }
        }

        setTimeout(async () => {
            let code = await dims.requestPairingCode(phoneNumber);
            code = code?.match(/.{1,4}/g)?.join("-") || code;
            console.log(chalk.black(chalk.bgGreen("Your Pairing Code : ")), chalk.black(chalk.white(code)));
        }, 3000);
    }

/** bagian pembaca status ada di sini **/
dims.ev.on("messages.upsert", async (chatUpdate) => {
try {
const mek = chatUpdate.messages[0]
if (!mek.message) return
mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message
if (mek.key && mek.key.remoteJid === 'status@broadcast'){
await dims.readMessages([mek.key]) }
if (!dims.public && !mek.key.fromMe && chatUpdate.type === 'notify') return
if (mek.key.id.startsWith('BAE5') && mek.key.id.length === 16) return
const m = smsg(dims, mek, store)
require("./case")(dims, m, chatUpdate, store)
} catch (err) {
console.log(err)
}
});

/** group partisipasi apdet **/
dims.ev.on('group-participants.update', async (anu) => {
console.log(anu)
try {
let metadata = await dims.groupMetadata(anu.id)
let participants = anu.participants
for (let num of participants) {
try {
ppuser = await dims.profilePictureUrl(num, 'image')
} catch (err) {
ppuser = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png?q=60'
}
try {
ppgroup = await dims.profilePictureUrl(anu.id, 'image')
} catch (err) {
ppgroup = 'https://i.ibb.co/RBx5SQC/avatar-group-large-v2.png?q=60'
}

/** welcome **/
const memb = metadata.participants.length
const yumiWlcm = await getBuffer(ppuser)
const yumiLft = await getBuffer(ppuser)

if (anu.action == 'add') {
const yumiName = num
const xtime = moment.tz('Asia/Kolkata').format('HH:mm:ss')
const xdate = moment.tz('Asia/Kolkata').format('DD/MM/YYYY')
const xmembers = metadata.participants.length
const wel = `╭─❖「 ${metadata.subject} 」
│❐ Welcome: @${yumiName.split("@")[0]}
│❐ Member: ${xmembers}th
│❐ Date: ${xdate}
╰───────────────┈ ⳹`
dims.sendMessage(anu.id, { image: yumiWlcm, caption: wel }, { quoted: {
key: {
fromMe: false, 
participant: '0@s.whatsapp.net', 
...({ remoteJid: 'status@broadcast' }) 
},
"message": {
"pollCreationMessage": {
"name": `Powered by Dims`,
"options": [
	{
"optionName": "KATANYA SEPUH"
	},
	{
"optionName": "BERANI VOTE GA"
	},
	{
"optionName": "VOTE LAH SEMUA"
	},
	{
"optionName": "KATANYA SEPUH"
	},
	{
"optionName": "SALAM DARI YUMI BOT"
	}
],
"selectableOptionsCount": 5
}}}})
/** leave **/
} else if (anu.action == 'remove') {
const yumiName = num
const yumiTime = moment.tz('Asia/Kolkata').format('HH:mm:ss')
const yumiDate = moment.tz('Asia/Kolkata').format('DD/MM/YYYY')
const yumimembers = metadata.participants.length
const say = `╭─❖「 ${metadata.subject} 」
│❐ Goodbye: @${yumiName.split("@")[0]}
│❐ Member: ${yumimembers}Th
│❐ Date: ${yumiDate}
╰───────────────┈ ⳹`
dims.sendMessage(anu.id, { image: yumiLft, caption : say }, { quoted: { 
key: {
fromMe: false, 
participant: '0@s.whatsapp.net', 
...({ remoteJid: 'status@broadcast' }) 
},
"message": {
"pollCreationMessage": {
"name": `Powered by Dims`,
"options": [
	{
"optionName": "KATANYA SEPUH"
	},
	{
"optionName": "BERANI VOTE GA"
	},
	{
"optionName": "VOTE LAH SEMUA"
	},
	{
"optionName": "KATANYA SEPUH"
	},
	{
"optionName": "SALAM DARI YUMI BOT"
	}
],
"selectableOptionsCount": 5
}}}})
/** promote **/
} else if (anu.action == 'promote') {
const yumiBuffer = await getBuffer(ppuser)
const yumiTime = moment.tz('Asia/Kolkata').format('HH:mm:ss')
const yumiDate = moment.tz('Asia/Kolkata').format('DD/MM/YYYY')
let yumiName = num
yumiBody = `Selamat @${yumiName.split("@")[0]} telah menjadi admin`
dims.sendMessage(anu.id, { text: yumiBody,
contextInfo: {
mentionedJid: [num],
"externalAdReply": {
"showAdAttribution": true,
"containsAutoReply": true,
"title": global.botname,
"body": '',
"previewType": "PHOTO",
"thumbnailUrl": '',
"thumbnail": yumiBuffer,
"sourceUrl": global.media.sgc 
}}})
/** demote **/
} else if (anu.action == 'demote') {
const yumiBuffer = await getBuffer(ppuser)
const yumiTime = moment.tz('Asia/Kolkata').format('HH:mm:ss')
const yumiDate = moment.tz('Asia/Kolkata').format('DD/MM/YYYY')
let yumiName = num
yumiBody = `Yahh @${yumiName.split("@")[0]} bukan admin lagi`
dims.sendMessage(anu.id, { text: yumiBody,
contextInfo: {
mentionedJid:[num],
"externalAdReply": {
"showAdAttribution": true,
"containsAutoReply": true,
"title": global.botname,
"body": '',
"previewType": "PHOTO",
"thumbnailUrl": '',
"thumbnail": yumiBuffer,
"sourceUrl": global.media.sgc
}}})
}
}
} catch (err) {
console.log(err)
}
})

/** setting **/
dims.decodeJid = (jid) => {
if (!jid) return jid;
if (/:\d+@/gi.test(jid)) {
let decode = jidDecode(jid) || {};
return (decode.user && decode.server && decode.user + "@" + decode.server) || jid;
} else return jid;
};

dims.ev.on("contacts.update", (update) => {
for (let contact of update) {
let id = dims.decodeJid(contact.id);
if (store && store.contacts) store.contacts[id] = { id, name: contact.notify };
}
});

dims.ev.on("contacts.upsert", (update) => {
for (let contact of update) {
let id = jidNormalizedUser(contact.id)
if (store && store.contacts) store.contacts[id] = { ...(contact || {}), isContact: true }
}
})

dims.getName = async (jid, withoutContact = false) => {
const id = dims.decodeJid(jid);
withoutContact = dims.withoutContact || withoutContact;
let v;

if (id.endsWith("@g.us")) {
return new Promise(async (resolve) => {
v = store.contacts[id] || {};
if (!(v.name || v.subject)) v = dims.groupMetadata(id) || {};
resolve(v.name || v.subject || PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international'));
});
} else {
v = id === '0@s.whatsapp.net' ? { id, name: 'WhatsApp' } : id === dims.decodeJid(dims.user.id) ? dims.user : (store.contacts[id] || {});
return (withoutContact ? '' : v.name) || v.subject || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international');
}
};

/** settings di config.js, bukan di sini **/
dims.public = true 

dims.serializeM = (m) => smsg(dims, m, store)

/** koneksi apdet **/
dims.ev.on('connection.update', async (update) => {
const { connection, lastDisconnect } = update
try {
if (connection === 'close') {
let reason = new Boom(lastDisconnect?.error)?.output.statusCode
if (reason === DisconnectReason.badSession) { 
console.log(`Bad Session File, Please Delete Session and Scan Again`); dims.logout(); 
} else if (reason === DisconnectReason.connectionClosed) { 
console.log("Connection closed, reconnecting...."); startBotz(); 
} else if (reason === DisconnectReason.connectionLost) {
console.log("Connection Lost from Server, reconnecting..."); startBotz(); 
} else if (reason === DisconnectReason.connectionReplaced) {
console.log("Connection Replaced, Another New Session Opened, Please Close Current Session First"); dims.logout();
} else if (reason === DisconnectReason.loggedOut) {
console.log(`Device Logged Out, Please Scan Again And Run.`); dims.logout();
} else if (reason === DisconnectReason.restartRequired) {
console.log("Restart Required, Restarting..."); startBotz(); 
} else if (reason === DisconnectReason.timedOut) { 
console.log("Connection TimedOut, Reconnecting..."); startBotz();
} else dims.end(`Unknown DisconnectReason: ${reason}|${connection}`)
} if (update.connection == "open" || update.receivedPendingNotifications == "true") {
lolcatjs.fromString('Connect, welcome owner!')
lolcatjs.fromString('Connected to = ' + JSON.stringify(dims.user, null, 2))
}} catch (err) {
console.log('Error Di Connection.update ' + err)
}
})

dims.ev.on("creds.update", saveCreds);

/** this function send message **/
dims.resize = async (image, width, height) => {
let oyy = await jimp.read(image)
let kiyomasa = await oyy.resize(width, height).getBufferAsync(jimp.MIME_JPEG)
return kiyomasa
}

/**
  * parseMention(s)
  * @param {string} text 
  * @returns {string[]}
**/
dims.parseMention = (text = '') => {
return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net')
}
            
/** 
  * Beton ni bos 
  * Waspadalah sosok mark
  * By Im-Dims
  * Yang hapus wm gw potong titit lu
**/

/**
  * @param {String} jid 
  * @param {String} text 
  * @param {String} footer 
  * @param {fs.PathLike} butText 
  * @param {String} butCmd 
  * @param {proto.WebMessageInfo} quoted 
  * @param {Object} options 
**/
dims.kirimBeton = async (jid, text, footer, butText, butCmd, quoted, options = {}) => {
dims.sendPresenceUpdate('composing', jid)
let msgs = generateWAMessageFromContent(jid, {
  viewOnceMessage: {
    message: {
        "messageContextInfo": {
          "deviceListMetadata": {},
          "deviceListMetadataVersion": 2
        },
        interactiveMessage: proto.Message.InteractiveMessage.create({
          body: proto.Message.InteractiveMessage.Body.create({
            text: text
          }),
          footer: proto.Message.InteractiveMessage.Footer.create({
            text: footer
          }),
          header: proto.Message.InteractiveMessage.Header.create({
          hasMediaAttachment: false
          }),
          contextInfo: {
          forwardingScore: 9999,
          isForwarded: false,
          mentionedJid: dims.parseMention(text)
          },
          externalAdReply: { 
          showAdAttribution: true, 
          renderLargerThumbnail: false, 
          mediaType: 1
          },
          nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
            buttons: [{
                "name": "quick_reply",
                "buttonParamsJson": `{\"display_text\":\"${butText}\",\"id\":\"${butCmd}\"}`
             }],
          })
       })
    }
  }
}, { quoted, ...options })

return await dims.relayMessage(jid, msgs.message, {})
}

dims.kirimListWoy = async (jid, text, body, footer, list, quoted, options = {}) => {
dims.sendPresenceUpdate('composing', jid)
let msgs = generateWAMessageFromContent(jid, {
  viewOnceMessage: {
    message: {
        "messageContextInfo": {
          "deviceListMetadata": {},
          "deviceListMetadataVersion": 2
        },
        interactiveMessage: proto.Message.InteractiveMessage.create({
          body: proto.Message.InteractiveMessage.Body.create({
            text: body
          }),
          footer: proto.Message.InteractiveMessage.Footer.create({
            text: footer
          }),
          header: proto.Message.InteractiveMessage.Header.create({
            title: text,
            subtitle: "",
            hasMediaAttachment: false
          }),
          contextInfo: {
          forwardingScore: 9999,
          isForwarded: false,
          mentionedJid: dims.parseMention(text)
          },
          externalAdReply: { 
          showAdAttribution: true, 
          renderLargerThumbnail: false, 
          mediaType: 1
          },
          nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
            buttons: [{
                "name": "single_select",
                "buttonParamsJson": JSON.stringify(list)
              }],
          })
        })
    }
  }
}, { quoted, ...options })

return await dims.relayMessage(jid, msgs.message, {})
}

/**
  * Kirim beton dokument
**/
dims.send2ButtDoc = async (jid, text, body, footer, titledoc, urldoc, urlmedia, titleButt, urlButt, iniBeton, iniId, quoted, options = {}) => {
dims.sendPresenceUpdate('composing', jid)
let msg = generateWAMessageFromContent(jid, {
  viewOnceMessage: {
    message: {
        "messageContextInfo": {
          "deviceListMetadata": {},
          "deviceListMetadataVersion": 2
        },
        interactiveMessage: proto.Message.InteractiveMessage.create({
          body: proto.Message.InteractiveMessage.Body.create({
            text: body
          }),
          footer: proto.Message.InteractiveMessage.Footer.create({
            text: footer
          }),
          header: proto.Message.InteractiveMessage.Header.create({
            title: text,
            subtitle: "",
            hasMediaAttachment: true, 
            ...(await prepareWAMessageMedia({ document: { url: urldoc }, mimetype: 'image/png', fileName: titledoc, jpegThumbnail: await dims.resize(urlmedia, 400, 400), fileLength: 0 }, { upload: dims.waUploadToServer }))
          }),
          contextInfo: {
          forwardingScore: 9999,
          isForwarded: false,
          mentionedJid: dims.parseMention(text)
          },
          externalAdReply: { 
          showAdAttribution: true, 
          renderLargerThumbnail: false, 
          mediaType: 1
          },
          nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
            buttons: [
               {
                 "name": "cta_url",
                 "buttonParamsJson": `{\"display_text\":\"${titleButt}\",\"url\":\"${urlButt}\",\"merchant_url\":\"${urlButt}\"}`
               },
               {
                 "name": "quick_reply",
                 "buttonParamsJson": `{\"display_text\":\"${iniBeton}\",\"id\":\"${iniId}\"}`
               }
            ],
          })
        })
    }
  }
}, { userJid: jid, quoted, ...options })

return await dims.relayMessage(jid, msg.message, {})
}

/**
  * Footer Ini Mah
  * By Im-Dims
  * Yang hapus wm gw potong titit lu
"*/
dims.sendFooter = async (jid, text, footer, quoted, options = {}) => {
  await dims.sendPresenceUpdate('composing', jid)
  let msg = await generateWAMessageFromContent(jid, {     
    interactiveMessage: {          
      body: {         
        text: text
      },     
      footer: {
        text: footer
      },     
      header: {
        hasMediaAttachment: false,
      },
      contextInfo: {
      forwardingScore: 9999,
      isForwarded: false,
      mentionedJid: dims.parseMention(text)
      },
      externalAdReply: { 
      showAdAttribution: true, 
      renderLargerThumbnail: false, 
      mediaType: 1
      },
      nativeFlowMessage: {
        buttons: [{ title: "Dims ganteng >,<" }]
      }   
    },
  }, 
  { quoted, ...options }
)
return await dims.relayMessage(jid, msg.message, {})
}

dims.sendFooterWithMedia = async (jid, text, footer, media, quoted, options = {}) => {
  await dims.sendPresenceUpdate('composing', jid)
  let msg = await generateWAMessageFromContent(jid, { 
    interactiveMessage: {          
      body: {         
        text: text
      },     
      footer: {
        text: footer
      },     
      header: {
        hasMediaAttachment: false,
        ...await prepareWAMessageMedia({ image: { url: media } }, { upload: dims.waUploadToServer })
      },    
      contextInfo: {
      forwardingScore: 9999,
      isForwarded: false,
      mentionedJid: dims.parseMention(text)
      },
      externalAdReply: { 
      showAdAttribution: true, 
      renderLargerThumbnail: false, 
      mediaType: 1
      },
      nativeFlowMessage: {
        buttons: [{ title: "Dims ganteng >,<" }]
      }   
    },
  }, 
  { quoted, ...options }
)
return await dims.relayMessage(jid, msg.message, {})
}

dims.sendListMsg = (jid, text = '', footer = '', title = '' , butText = '', sects = [], quoted) => {
let sections = sects
let listMes = {
text: text,
footer: footer,
title: title,
buttonText: butText,
sections
}
dims.sendMessage(jid, listMes, { quoted: quoted })
}

/** kirim pesan dengan tag **/
dims.sendTextWithMentions = async (jid, text, quoted, options = {}) => {
return await dims.sendMessage(jid, { text: text, contextInfo: { mentionedJid: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net') }, ...options }, { quoted })
}

/**
  * Send Contact Array
  * @param {String} jid 
  * @param {String} number 
  * @param {String} name 
  * @param {Object} quoted 
  * @param {Object} options 
**/
dims.sendContactArray = async (jid, data, quoted, options) => {
if (!Array.isArray(data[0]) && typeof data[0] === 'string') data = [data]
let contacts = []
for (let [number, name, isi, isi1, isi2, isi3, isi4, isi5] of data) {
number = number.replace(/[^0-9]/g, '')
let njid = number + '@s.whatsapp.net'
let biz = await dims.getBusinessProfile(njid).catch(_ => null) || {}
// N:;${name.replace(/\n/g, '\\n').split(' ').reverse().join(';')};;;
let vcard = `
BEGIN:VCARD
VERSION:3.0
N:Sy;Bot;;;
FN:${name.replace(/\n/g, '\\n')}
item.ORG:${isi}
item1.TEL;waid=${number}:${PhoneNumber('+' + number).getNumber('international')}
item1.X-ABLabel:${isi1}
item2.EMAIL;type=INTERNET:${isi2}
item2.X-ABLabel:Email
item3.ADR:;;${isi3};;;;
item3.X-ABADR:ac
item3.X-ABLabel:Region
item4.URL:${isi4}
item4.X-ABLabel:Website
item5.X-ABLabel:${isi5}
END:VCARD`.trim()
contacts.push({ vcard, displayName: name })
}
return await dims.sendMessage(jid, { contacts: { displayName: (contacts.length > 1 ? `2013 kontak` : contacts[0].displayName) || null, contacts }}, { quoted, ...options })
}
     
dims.getFile = async (PATH, returnAsFilename) => {
let res, filename
const data = Buffer.isBuffer(PATH) ? PATH : /^data:.*?\/.*?;base64,/i.test(PATH) ? Buffer.from(PATH.split`,` [1], 'base64') : /^https?:\/\//.test(PATH) ? await (res = await fetch(PATH)).buffer() : fs.existsSync(PATH) ? (filename = PATH, fs.readFileSync(PATH)) : typeof PATH === 'string' ? PATH : Buffer.alloc(0)
if (!Buffer.isBuffer(data)) throw new TypeError('Result is not a buffer')
const type = await FileType.fromBuffer(data) || {
mime: 'application/octet-stream',
ext: '.bin'
}
if (data && returnAsFilename && !filename)(filename = path.join(__dirname, './tmp/' + new Date * 1 + '.' + type.ext), await fs.promises.writeFile(filename, data))
return {
res,
filename,
...type,
data,
deleteFile() {
return filename && fs.promises.unlink(filename)
}
}
}

dims.downloadMediaMessage = async (message) => {
let mime = (message.msg || message).mimetype || ''
let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
const stream = await downloadContentFromMessage(message, messageType)
let buffer = Buffer.from([])
for await(const chunk of stream) {
buffer = Buffer.concat([buffer, chunk])}
return buffer} 

dims.sendFile = async (jid, path, filename = '', caption = '', quoted, ptt = false, options = {}) => {
let type = await dims.getFile(path, true)
let { res, data: file, filename: pathFile } = type
if (res && res.status !== 200 || file.length <= 65536) {
try { throw { json: JSON.parse(file.toString()) } }
catch (e) { if (e.json) throw e.json }
}
let opt = { filename }
if (quoted) opt.quoted = quoted
if (!type) options.asDocument = true
let mtype = '', mimetype = type.mime, convert
if (/webp/.test(type.mime) || (/image/.test(type.mime) && options.asSticker)) mtype = 'sticker'
else if (/image/.test(type.mime) || (/webp/.test(type.mime) && options.asImage)) mtype = 'image'
else if (/video/.test(type.mime)) mtype = 'video'
else if (/audio/.test(type.mime)) (
convert = await (ptt ? toPTT : toAudio)(file, type.ext),
file = convert.data,
pathFile = convert.filename,
mtype = 'audio',
mimetype = 'audio/ogg; codecs=opus'
)
else mtype = 'document'
if (options.asDocument) mtype = 'document'

let message = {
...options,
caption,
ptt,
[mtype]: { url: pathFile },
mimetype
}
let m
try {
m = await dims.sendMessage(jid, message, { ...opt, ...options })
} catch (e) {
console.error(e)
m = null
} finally {
if (!m) m = await dims.sendMessage(jid, { ...message, [mtype]: file }, { ...opt, ...options })
return m
}
}

dims.sendVideoAsSticker = async (jid, path, quoted, options = {}) => {
let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
let buffer
if (options && (options.packname || options.author)) {
buffer = await writeExifVid(buff, options)
} else {
buffer = await videoToWebp(buff)
}
await dims.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
return buffer
}

dims.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
let quoted = message.msg ? message.msg : message
let mime = (message.msg || message).mimetype || ''
let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
const stream = await downloadContentFromMessage(quoted, messageType)
let buffer = Buffer.from([])
for await(const chunk of stream) {
buffer = Buffer.concat([buffer, chunk])
}
let type = await FileType.fromBuffer(buffer)
trueFileName = attachExtension ? (filename + '.' + type.ext) : filename
await fs.writeFileSync(trueFileName, buffer)
return trueFileName
}

dims.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
let quoted = message.msg ? message.msg : message;
let mime = (message.msg || message).mimetype || '';
let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
const stream = await downloadContentFromMessage(quoted, messageType);
let buffer = Buffer.from([]);
for await( const chunk of stream ) {
buffer = Buffer.concat([buffer, chunk]);
}
let type = await FileType.fromBuffer(buffer);
let trueFileName = attachExtension ? (filename + '.' + type.ext) : filename;
let savePath = path.join(__dirname, 'tmp', trueFileName); // Save to 'tmp' folder
await fs.writeFileSync(savePath, buffer);
return savePath;
};

dims.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
let buffer
if (options && (options.packname || options.author)) {
buffer = await writeExifImg(buff, options)
} else {
buffer = await imageToWebp(buff)
}
await dims.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
return buffer
}

dims.sendText = (jid, text, quoted = '', options) => {
dims.sendMessage(jid, { text: text, ...options }, { quoted })
return dims;
}

/** batas dari function message **/
}
startBotz();

/** realod file **/
let file = require.resolve(__filename)
fs.watchFile(file, () => {
  fs.unwatchFile(file)
  console.log(`Update ${__filename}`)
  delete require.cache[file]
  require(file)
})