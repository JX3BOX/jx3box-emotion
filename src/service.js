import axios from "axios";
import JX3BOX from "@jx3box/jx3box-common/data/jx3box.json";
const { __cms } = JX3BOX;

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

export { $cms };
