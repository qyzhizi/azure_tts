

const DEFAULT_HEADERS = {
    "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36",
    "Content-Type": "application/ssml+xml",
    "X-Microsoft-OutputFormat": "audio-16khz-128kbitrate-mono-mp3",
};

const speechApi = async (ssml, region, ttsHeaders) => {
    const API_URL = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            responseType: "arraybuffer",
            headers: ttsHeaders,
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
        const secretKey = env.SECRET_KEY;
        const region = env.REGION
        const ttsHeaders = {
            ...DEFAULT_HEADERS,
            "Ocp-Apim-Subscription-Key": secretKey // 新增属性
        };
        // 解析请求 URL
        const url = new URL(request.url);

        const clientIP = request.headers.get("CF-Connecting-IP")

        if (url.pathname == "/") {
            try {
                const html = await fetch("https://raw.githubusercontent.com/qyzhizi/azure_tts/main/public/index.html");
                
                // 检查响应是否成功
                if (!html.ok) {
                    throw new Error(`HTTP error! Status: ${html.status}`);
                }
            
                const page = await html.text();
                return new Response(page, {
                    headers: {
                        "content-type": "text/html;charset=UTF-8",
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Credentials": "true",
                        "Access-Control-Allow-Headers": "*",
                        "Access-Control-Allow-Methods": "*",
                        "ip": `Access cloudflare's ip:${clientIP}`
                    },
                });
            } catch (error) {
                console.error("Fetch failed:", error);
                
                // Return a generic error response
                return new Response("Error fetching the  index.html page.", {
                    status: 500,
                    headers: {
                        "content-type": "text/plain;charset=UTF-8",
                        "Access-Control-Allow-Origin": "*",
                    },
                });
            }
        }else if (url.pathname === "/audio") {
            try {
                if (request.method === "POST") {
                    const body = await request.json();
                    const { text, rate, pitch, voice, voiceStyle } = body;

                    if (!text || !voice) {
                        return new Response("Missing required fields", { status: 400 });
                    }
                    const ssml = `<speak xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xmlns:emo="http://www.w3.org/2009/10/emotionml" version="1.0" xml:lang="en-US">
                    <voice name="${voice}">
                    <mstts:express-as style="${voiceStyle}">
                        <prosody rate="${rate}%" pitch="${pitch}%">
                        ${text}
                       </prosody>
                        </mstts:express-as>
                    </voice>
                    </speak>`;
                
                    const audio = await speechApi(ssml, region,ttsHeaders);

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