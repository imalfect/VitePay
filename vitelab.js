import dotenv from 'dotenv'
import ViteJSHTTP from "@vite/vitejs-http";
import ViteJS from "@vite/vitejs";

dotenv.config()


const WS_service = new ViteJSHTTP.HTTP_RPC(process.env.NODE_URL);
export const provider = new ViteJS.ViteAPI(WS_service, () => {
    console.log("Connected");
});



async function e() {
    try {
        console.log(await provider.request(
            'mintage_getTokenInfoById',
            'tti_5649544520544f4b454e6e40'
        ))
    } catch (e) {
        console.log(e)
    }

}

e()
