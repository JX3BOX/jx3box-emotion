/**
 * @description: 骚话渲染
 * @author: Kaviilee
 * @version: 1.2.6
 */

import JX3BOX from "@jx3box/jx3box-common/data/jx3box.json";
import { keyBy } from "lodash";
const { __imgPath, __dataPath } = JX3BOX;

const queue = [];
const emotionList = [];
let loading = false;

// 获取全部表情
async function loadEmotionList() {
    // 有结果直接过
    if (emotionList.length > 0) return;
    // 没结果但是正在loading, 等待不知道谁触发的加载完成
    if (loading && emotionList.length === 0) {
        return await new Promise(resolve => {
            queue.push(resolve);
        });
    }
    // 没结果也没在loading,那就得我来了！
    loading = true;
    // 尝试从sessionStorage中获取其他页面的缓存
    const emotion = sessionStorage.getItem("jx3_emotion");
    if (emotion) {
        const emotions = JSON.parse(emotion);
        emotionList.push(
            ...emotions
                .map(item => item.items)
                .reduce((a, b) => a.concat(b), [])
        );
        emotionList.push(...JSON.parse(emotion));
    } else {
        const data = await fetch(
            `${__dataPath}emotion/output/catalog.json`
        ).then(response => response.json());
        // 将二维数组转为一维数组
        emotionList.push(
            ...data.map(item => item.items).reduce((a, b) => a.concat(b), [])
        );
        sessionStorage.setItem("jx3_emotion", JSON.stringify(data));
    }
    // 通知等待队列里面的有数据了
    loading = false;
    queue.forEach(resolve => resolve());
    return;
}

class JX3_EMOTION {
    /**
     * @param {string} joke 骚话字符串
     */
    constructor(joke) {
        this.joke = String(joke).trim();
    }

    /**
     *
     * @param {Object} options
     * @param {number} options.maxWidth 最大宽度
     * @param {number} options.maxHeight 最大高度
     * @returns
     */
    async _renderHTML(options) {
        // 没有表情符号直接返回
        if (!this.joke.includes("#")) return this.joke;

        await loadEmotionList();
        const emotionMap = keyBy(emotionList, "key");

        // 替换表情符号为img标签
        for (const key in emotionMap) {
            if (this.joke.includes(key)) {
                let url = emotionMap[key].filename;
                // http 开头的绝对地址，直接使用，否则拼接一下链接。
                if (!url.startsWith("http")) {
                    url = `${__imgPath}emotion/output/${emotionMap[key].filename}`;
                } // 如果是外链表情，跳过
                let styles = "";
                const { maxWidth = 60, maxHeight = 60 } = options || {};
                styles += `max-width: ${maxWidth}px;`;
                styles += `max-height: ${maxHeight}px;`;

                this.joke = this.joke.replaceAll(
                    key,
                    `<img src="${url}" alt="${key}" title="${key}" style="${styles}" />`
                );
            }
        }

        return this.joke;
    }
}

export default JX3_EMOTION;
