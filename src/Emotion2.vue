<template>
    <div class="c-jx3box-emotion">
        <el-tabs type="card" v-if="type === 'default'">
            <el-tab-pane
                v-for="item in decorationEmotion"
                :key="item.group_id"
                :label="item.group_name">
                <span
                    v-for="emotion in item.items"
                    :key="emotion.emotion_id"
                    class="c-jx3box-emotion-item"
                    @click="handleEmotionClick(emotion)">
                    <img
                        :src="emotionLink(emotion.filename)"
                        :alt="emotion.key"
                        :title="emotion.key" />
                </span>
            </el-tab-pane>
        </el-tabs>
        <el-popover
            v-else
            placement="top"
            trigger="click"
            :visible-arrow="false"
            popper-class="c-jx3box-emotion-pop"
            ref="emotion">
            <div class="c-jx3box-emotion-pop__content">
                <el-icon class="u-close" @click="closePop"><Close /></el-icon>
                <div class="u-title">表情</div>

                <el-tabs
                    class="u-tabs"
                    type="card"
                    tab-position="bottom"
                    size="small">
                    <el-tab-pane
                        v-for="item in decorationEmotion"
                        :key="item.group_id"
                        :label="item.group_name">
                        <template #label>
                            <img
                                :src="emotionLink(item.items[0].filename)"
                                :alt="item.items[0].key"
                                :title="item.group_name"
                                class="u-tab-label" />
                        </template>
                        <div class="c-jx3box-emotion-list">
                            <span
                                v-for="emotion in item.items"
                                :key="emotion.emotion_id"
                                class="c-jx3box-emotion-item"
                                @click="handleEmotionClick(emotion)">
                                <img
                                    :src="emotionLink(emotion.filename)"
                                    :alt="emotion.key"
                                    :title="emotion.key" />
                            </span>
                        </div>
                    </el-tab-pane>
                </el-tabs>
            </div>
            <template #reference>
                <img
                    slot="reference"
                    class="u-reference"
                    width="24"
                    height="24"
                    src="../data/img/emotion.svg"
                    alt="" />
            </template>
        </el-popover>
    </div>
</template>

<script>
import JX3BOX from "@jx3box/jx3box-common/data/jx3box.json";
import { $cms } from "./service";
import User from "@jx3box/jx3box-common/js/user.js";

const { __imgPath, __dataPath } = JX3BOX;
export default {
    name: "Emotion",
    props: {
        type: {
            type: String,
            default: "default",
        },
        max: {
            type: Number,
            default: 4,
        },
    },
    emits: ["selected"],
    data() {
        return {
            emotionList: [],
            EmojiPath: __imgPath + "emotion/output/",

            decoration: [],
        };
    },
    created() {
        this.loadEmotionList();
        this.loadDecoration();
    },
    computed: {
        decorationEmotion({ emotionList, decoration }) {
            // 默认表情
            const defaultEmo = emotionList.filter(item => item.group_id === 0);
            if (decoration.length === 0) {
                return defaultEmo;
            } else {
                // 购买的表情
                const arr = emotionList.filter(item =>
                    decoration.includes(item.group_name)
                );
                // 截取4个
                return [...defaultEmo, ...arr].slice(0, this.max);
            }
        },
    },
    methods: {
        /**
         * 点击表情触发事件
         * @param {Object} emotion 表情对象
         */
        handleEmotionClick(emotion) {
            this.$emit("selected", emotion);
            this.closePop();
        },
        emotionLink(filename) {
            if (!filename) return "";
            if (filename.startsWith("http")) {
                return filename;
            }
            return `${this.EmojiPath}${filename}`;
        },
        // 获取全部表情
        loadEmotionList() {
            try {
                const emotion = sessionStorage.getItem("jx3_emotion");
                if (emotion) {
                    this.emotionList = JSON.parse(emotion);
                    return;
                } else {
                    fetch(`${__dataPath}emotion/output/catalog.json`)
                        .then(response => response.json())
                        .then(data => {
                            this.emotionList = data;
                            sessionStorage.setItem(
                                "jx3_emotion",
                                JSON.stringify(data)
                            );
                        });
                }
            } catch (e) {
                fetch(`${__dataPath}emotion/output/catalog.json`)
                    .then(response => response.json())
                    .then(data => {
                        this.emotionList = data;
                        sessionStorage.setItem(
                            "jx3_emotion",
                            JSON.stringify(data)
                        );
                    });
            }
        },
        // 获取虚拟资产
        loadDecoration() {
            if (!User.isLogin()) return;
            $cms()
                .get(`/api/cms/user/decoration`, {
                    params: {
                        type: "emotion",
                        using: 1,
                        // uid: 8719
                    },
                })
                .then(res => {
                    this.decoration = res.data?.data?.map(item => item?.val);
                });
        },

        // 关闭弹窗
        closePop() {
            if (this.$refs.emotion) {
                this.$refs.emotion.hide();
            }
        },
    },
};
</script>

<style lang="less">
.scrollbar(@width: 4px) {
    // max-height: 70vh;
    &::-webkit-scrollbar {
        width: @width;
    }
    &::-webkit-scrollbar-track,
    &::-webkit-scrollbar-track-piece {
        background-color: #fafafa;
        border-radius: 6px;
    }
    &::-webkit-scrollbar-thumb {
        background-color: #eee;
        border-radius: 6px;
    }
    &::-webkit-scrollbar-button,
    &::-webkit-scrollbar-corner,
    &::-webkit-resizer {
        display: none;
    }
}
.c-jx3box-emotion {
    margin: 16px 0;

    .c-jx3box-emotion-item {
        display: inline-flex;
        padding: 4px;
        margin: 2px;
        border: 1px solid #fff;
        cursor: pointer;
        width: 20px;

        &:hover {
            border-color: #ccc;
        }
    }

    .u-reference {
        cursor: pointer;
        .pr;
        top: -1px;
    }
}
.c-jx3box-emotion-pop {
    padding: 0 !important;
    width: 380px !important;
}
@media screen and (max-width: 720px) {
    .c-jx3box-emotion-pop {
        width: 310px !important;
    }
}
.c-jx3box-emotion-pop__content {
    position: relative;
    .u-tab-label {
        width: 20px;
        height: 20px;
        position: relative;
        top: 4px;
    }
    .u-title {
        font-size: 14px;
        padding: 10px;
    }
    .u-close {
        position: absolute;
        top: 10px;
        right: 10px;
        cursor: pointer;
        font-size: 16px;
    }
    .c-jx3box-emotion-list {
        height: 200px;
        overflow: hidden auto;
        .scrollbar();
        padding-left: 8px;
    }
    .u-tabs {
        .el-tabs__nav-scroll {
            background-color: #fafbfc;
            border-top: 1px solid #eee;
        }
        .el-tabs__nav {
            border-radius: 0 !important;
            border-top: none !important;
            border-right: none !important;
            border-left: none !important;
        }
        .el-tabs__item {
            border: none !important;
            line-height: 40px;
            height: 40px;
            padding: 0 10px !important;
            &.is-active {
                background-color: #fff;
            }
            // .pr;
            // &:after{
            //     content:'';
            //     .db;
            //     .pa;.lt(0,-1px);
            //     width:100%;
            //     height: 2px;
            //     background-color:#fff;
            // }
        }
    }
    .c-jx3box-emotion-item {
        display: inline-block;
        box-sizing: border-box;
        padding: 4px;
        margin: 2px;
        border: 1px solid #fff;
        cursor: pointer;
        width: 32px;
        height: 32px;

        img {
            .size(20px);
        }

        &:hover {
            border-color: #ccc;
        }
    }
}
</style>
