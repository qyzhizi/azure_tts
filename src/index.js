// addEventListener('fetch', event => {
//     event.respondWith(handleRequest(event.request))
// })


function generateUUID() {
    let uuid = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'.replace(/[x]/g, function (c) {
        let r = Math.random() * 16 | 0,
            v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
    return uuid;
}

const API_URL = "https://eastus.tts.speech.microsoft.com/cognitiveservices/v1";
const DEFAULT_HEADERS = {
    "Ocp-Apim-Subscription-Key": "E0zTJnd2aWsD058bkqRe5qpMNeBqNRZCLD47SnsYtaFVqeCE0KXrJQQJ99ALACYeBjFXJ3w3AAAYACOG9BFU",
    "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36",
    "Content-Type": "application/ssml+xml",
    "X-Microsoft-OutputFormat": "audio-16khz-128kbitrate-mono-mp3",
};

const speechApi = async (ssml) => {
    // const data = JSON.stringify({ ssml});

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            responseType: "arraybuffer",
            headers: DEFAULT_HEADERS,
            body: ssml
        });

        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }

        return response.arrayBuffer();
    } catch (error) {
        console.error("Error during API request:", error);
        throw error;
    }
};

export default {
    async fetch(request, env) {
        // 解析请求 URL
        const url = new URL(request.url);

        const clientIP = request.headers.get("CF-Connecting-IP")

        if (url.pathname == "/") {
            const html = await fetch("https://raw.githubusercontent.com/qyzhizi/azure_tts/main/public/index.html")

            const page = await html.text()
            return new Response(page, {
                headers: {
                    "content-type": "text/html;charset=UTF-8",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Credentials": "true",
                    "Access-Control-Allow-Headers": "*",
                    "Access-Control-Allow-Methods": "*",
                    "ip": `Access cloudflare's ip:${clientIP}`
                },
            })
        } else if (url.pathname === "/audio") {
            try {
                if (request.method === "POST") {
                    const body = await request.json();
                    const { text, rate, pitch, voice, voiceStyle } = body;

                    if (!text || !voice) {
                        return new Response("Missing required fields", { status: 400 });
                    }

                    const ssml = `<speak version="1.0" xml:lang="en-US">
                        <voice xml:lang="en-US" xml:gender="Female" name="en-US-AvaMultilingualNeural"">
                            ${text}
                        </voice>
                    </speak>`;

                    const audio = await speechApi(ssml);

                    return new Response(audio, {
                        headers: {
                            "Content-Type": "audio/mpeg",
                            "Access-Control-Allow-Origin": "*",
                        },
                    });
                } else {
                    return new Response("Method not allowed", { status: 405 });
                }
            } catch (error) {
                console.error("Error:", error);
                return new Response(JSON.stringify({ error: error.message }), {
                    status: 500,
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*",
                    },
                });
            }
        }else if (url.pathname == "/legado") {
            const origin = url.origin
            const params = new URLSearchParams(url.search);
            // 获取查询参数中的文本
            // const text = params.get("text");
            // 获取查询参数中的语速
            const rate = params.get("rate");
            // 获取查询参数中的音高
            const pitch = params.get("pitch");
            // 获取查询参数中的音色
            const voice = params.get("voice");
            // 获取查询参数中的音色风格
            const voiceStyle = params.get("voiceStyle");

            const dataJson = {
                "concurrentRate": "",//并发率
                "contentType": "audio/mpeg",
                "header": "",
                "id": Date.now(),
                "lastUpdateTime": Date.now(),
                "loginCheckJs": "",
                "loginUi": "",
                "loginUrl": "",
                "name": `Azure  ${voice} ${voiceStyle} pitch: ${pitch} rate:${rate}`,
                "url": `${origin}/audio?text={{speakText}}&rate=${rate}&pitch=${pitch}&voice=${voice}&voiceStyle=${voiceStyle},{"method":"GET"}`,
            }

            return new Response(JSON.stringify(dataJson), {
                headers: {
                    "content-type": "application/json;charset=UTF-8",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Credentials": "true",
                    "Access-Control-Allow-Headers": "*",
                    "Access-Control-Allow-Methods": "*",
                    "ip": `Access cloudflare's ip:${clientIP}`
                },
            })



        } else if (url.pathname == "/sourcereader") {
            const origin = url.origin
            const params = new URLSearchParams(url.search);
            // 获取查询参数中的文本
            // const text = params.get("text");
            // 获取查询参数中的语速
            const rate = params.get("rate");
            // 获取查询参数中的音高
            const pitch = params.get("pitch");
            // 获取查询参数中的音色
            const voice = params.get("voice");
            // 获取查询参数中的音色风格
            const voiceStyle = params.get("voiceStyle");

            const dataJson = [{
                "customOrder": 100,
                "id": Date.now(),
                "lastUpdateTime": Date.now(),
                "name": ` ${voice} ${voiceStyle} pitch: ${pitch} rate:${rate}`,
                "url": `${origin}/audio?text={{speakText}}&rate=${rate}&pitch=${pitch}&voice=${voice}&voiceStyle=${voiceStyle},{"method":"GET"}`,
            }]
            return new Response(JSON.stringify(dataJson), {
                headers: {
                    "content-type": "application/json;charset=UTF-8",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Credentials": "true",
                    "Access-Control-Allow-Headers": "*",
                    "Access-Control-Allow-Methods": "*",
                    "ip": `Access cloudflare's ip:${clientIP}`
                },
            })
        }
        else {
            return new Response("page", {
                headers: {
                    "content-type": "text/html;charset=UTF-8",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Credentials": "true",
                    "Access-Control-Allow-Headers": "*",
                    "Access-Control-Allow-Methods": "*",
                    "ip": `Access cloudflare's ip:${clientIP}`
                },
            })
        }

    }
}