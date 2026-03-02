const { cmd } = require("../command");
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");

/* ================= TO IMAGE ================= */

cmd({
  pattern: "toimg",
  react: "🖼️",
  desc: "Sticker to Image",
  category: "converter",
  filename: __filename
}, async (conn, mek, m, { from, quoted, reply }) => {
  try {
    if (!quoted || !quoted.stickerMessage)
      return reply("❌ Sticker reply karo");

    const buffer = await conn.downloadMediaMessage(quoted);
    await conn.sendMessage(from, {
      image: buffer,
      caption: `
╭━〔 🌐 ᗩᗪᗴᗴᒪ ᙭ᗰᗪ 〕━⬣
┃ *🖼️ Sticker → Image*
╰━━━━━━━━━━━━━━━━━━━━⬣`
    }, { quoted: mek });

  } catch (e) {
    reply("❌ Convert failed");
  }
});

/* ================= TO AUDIO ================= */

cmd({
  pattern: "toaudio",
  react: "🎵",
  desc: "Video to Audio",
  category: "converter",
  filename: __filename
}, async (conn, mek, m, { from, quoted, reply }) => {
  try {
    if (!quoted || !quoted.videoMessage)
      return reply("❌ Video reply karo");

    const input = path.join(__dirname, "temp.mp4");
    const output = path.join(__dirname, "audio.mp3");

    fs.writeFileSync(input, await conn.downloadMediaMessage(quoted));

    ffmpeg(input)
      .toFormat("mp3")
      .on("end", async () => {
        await conn.sendMessage(from, {
          audio: fs.readFileSync(output),
          mimetype: "audio/mpeg"
        }, { quoted: mek });

        fs.unlinkSync(input);
        fs.unlinkSync(output);
      })
      .run();

  } catch (e) {
    reply("❌ Audio convert failed");
  }
});

/* ================= TO VOICE ================= */

cmd({
  pattern: "toptt",
  react: "🎙️",
  desc: "Audio to Voice Note",
  category: "converter",
  filename: __filename
}, async (conn, mek, m, { from, quoted, reply }) => {
  try {
    if (!quoted || !quoted.audioMessage)
      return reply("❌ Audio reply karo");

    await conn.sendMessage(from, {
      audio: await conn.downloadMediaMessage(quoted),
      ptt: true,
      mimetype: "audio/ogg; codecs=opus"
    }, { quoted: mek });

  } catch (e) {
    reply("❌ Voice convert failed");
  }
});

/* ================= TO VIDEO ================= */

cmd({
  pattern: "tovideo",
  react: "🎥",
  desc: "Audio to Black Video",
  category: "converter",
  filename: __filename
}, async (conn, mek, m, { from, quoted, reply }) => {
  try {
    if (!quoted || !quoted.audioMessage)
      return reply("❌ Audio reply karo");

    const audio = path.join(__dirname, "audio.mp3");
    const video = path.join(__dirname, "video.mp4");

    fs.writeFileSync(audio, await conn.downloadMediaMessage(quoted));

    ffmpeg()
      .input("color=c=black:s=720x720")
      .inputFormat("lavfi")
      .input(audio)
      .outputOptions("-shortest")
      .save(video)
      .on("end", async () => {
        await conn.sendMessage(from, {
          video: fs.readFileSync(video),
          mimetype: "video/mp4"
        }, { quoted: mek });

        fs.unlinkSync(audio);
        fs.unlinkSync(video);
      });

  } catch (e) {
    reply("❌ Video convert failed");
  }
});
