import axios from "axios";
import JX3BOX from "@jx3box/jx3box-common/data/jx3box.json";
const { __cms } = JX3BOX;

let emotionDecorationRequest = null;
let emotionDecorationToken = null;

const $cms = options => {
    const domain = (options && options.domain) || __cms;
    let config = {
        // 同时发送cookie和basic auth
        withCredentials: true,
        auth: {
            username: (localStorage && localStorage.getItem("token")) || "",
            password: "cms common request",
        },
        baseURL:
            process.env.VUE_APP_CMS_API ||
            (process.env.NODE_ENV === "production" ? domain : "/"),
        headers: {},
    };

    // 创建实例
    const ins = axios.create(config);

    return ins;
};

const getEmotionDecorations = () => {
    const token =
        (typeof localStorage !== "undefined" && localStorage.getItem("token")) ||
        "";

    if (!emotionDecorationRequest || emotionDecorationToken !== token) {
        emotionDecorationToken = token;
        const request = $cms()
            .get(`/api/cms/user/decoration`, {
                params: {
                    type: "emotion",
                    using: 1,
                },
            })
            .then(res => res.data?.data?.map(item => item?.val) || [])
            .catch(error => {
                if (emotionDecorationRequest === request) {
                    emotionDecorationRequest = null;
                    emotionDecorationToken = null;
                }
                throw error;
            });
        emotionDecorationRequest = request;
    }

    return emotionDecorationRequest;
};

export { $cms, getEmotionDecorations };
