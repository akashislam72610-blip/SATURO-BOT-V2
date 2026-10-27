const axios = require("axios"), fs = require("fs"), path = require("path");

const baseApiUrl = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "album",
                version: "2.7",
                author: "MahMUD",
                countDown: 10,
                role: 0,
                category: "media",
                description: {
                        en: "Watch video albums from various categories",
                        vi: "Xem album video từ các danh mục khác nhau"
                },
                guide: {
                        en: '{pn} [category/page] | {pn} add [category] (reply to video) | {pn} list [page]',
                        vi: '{pn} [danh mục/trang] | {pn} add [danh mục] (phản hồi video) | {pn} list [trang]'
                }
        },

        langs: {
                en: {
                        noInput: "• Baby, please specify a category or reply to a video.",
                        error: "× API error: %1. Contact MahMUD for help.\n•WhatsApp: 01836298139",
                        invalidPage: "× Invalid page! Max page: %1",
                        invalidSelect: " Invalid selection.",
                        categoryNotFound: "× Category '%1' not found! Please check the list.",
                        header: "𝐀𝐯𝐚𝐢𝐥𝐚𝐛𝐥𝐞 𝐀𝐥𝐛𝐮𝐦 𝐕𝐢𝐝𝐞𝐨",
                        footer: "\n♻ | 𝐏𝐚𝐠𝐞 [%1/%2]<😘\nℹ | 𝐓𝐲𝐩𝐞 !%3 %4 - 𝐭𝐨 𝐬𝐞𝐞 𝐧𝐞𝐱𝐭 𝐩𝐚𝐠𝐞."
                },
                vi: {
                        noInput: "• Cưng ơi, vui lòng chỉ định danh mục hoặc phản hồi video.",
                        error: "× Lỗi: %1. Liên hệ MahMUD để hỗ trợ.\n•WhatsApp: 01836298139",
                        invalidPage: "× Trang không hợp lệ! Trang tối đa: %1",
                        invalidSelect: "× Lựa chọn không hợp lệ.",
                        categoryNotFound: "× Không tìm thấy danh mục '%1'! Vui lòng kiểm tra danh sách.",
                        header: "𝐀𝐯𝐚𝐢𝐥𝐚𝐛𝐥𝐞 𝐀𝐥𝐛𝐮𝐦 𝐕𝐢𝐝𝐞𝐨",
                        footer: "\n♻ | Trang [%1/%2]<😘\nℹ | Nhập !%3 %4 - để xem trang tiếp theo."
                }
        },

        onStart: async function ({ api, event, args, message, getLang }) {
                const authorName = String.fromCharCode(77, 97, 104, 77, 85, 68);
                if (this.config.author !== authorName) return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);

                try {
                        if (args[0] === "add") {
                                if (!args[1] || event.type !== "message_reply" || !event.messageReply.attachments.length) return message.reply(getLang("noInput"));
                                api.setMessageReaction("⏳", event.messageID, () => {}, true);                                
                                const imgurRes = await axios.get(`${await baseApiUrl()}/imgur?url=${encodeURIComponent(event.messageReply.attachments[0].url)}`);
                                const res = await axios.post(`${await baseApiUrl()}/album/add`, { category: args[1].toLowerCase(), videoUrl: imgurRes.data.link });                                
                                api.setMessageReaction("🪽", event.messageID, () => {}, true);
                                return message.reply(res.data.message);
                        }

                        if (args[0] === "list") {
                                api.setMessageReaction("⏳", event.messageID, () => {}, true);
                                const page = parseInt(args[1]) || 1;
                                const res = await axios.get(`${await baseApiUrl()}/api/album2/mahmud/list?page=${page}`);
                                api.setMessageReaction("🪽", event.messageID, () => {}, true);                                
                                if (res.data.error) return message.reply(res.data.error);
                                return message.reply(res.data.message);
                        }

                        api.setMessageReaction("⏳", event.messageID, () => {}, true);
                        const configRes = await axios.get(`${await baseApiUrl()}/api/album2/mahmud/display`);
                        const { displayNames, realCategories, captions } = configRes.data;

                        if (args[0] && isNaN(args[0])) {
                                const inputCategory = args[0].toLowerCase();
                                const matchedCategory = realCategories.find(cat => cat.toLowerCase() === inputCategory);
                                if (!matchedCategory) {
                                        api.setMessageReaction("❌", event.messageID, () => {}, true);
                                        return message.reply(getLang("categoryNotFound", args[0]));
                   
