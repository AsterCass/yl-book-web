import {Enum} from "@/constants/enums/common.js";

export const BookStatusEnum = new Enum({
    PRE: {code: 0, name: '待分配', desc: '已创建、未分配雇员、未到开始时间', color: 'rgb(245, 166, 35)'},
    WORK: {code: 1, name: '已分配', desc: '已分配雇员、等待开始', color: 'rgb(68, 117, 80)'},
    IN_PROGRESS: {code: 2, name: '进行中', desc: '已分配且服务进行中', color: 'rgb(52, 152, 219)'},
    DONE: {code: 3, name: '已完成', desc: '已分配且已过结束时间', color: 'rgb(127, 140, 141)'},
    EXPIRED: {code: 4, name: '已过期', desc: '始终未分配却已过开始时间（无人接单/爽约）', color: 'rgb(155, 89, 182)'},
    CANCEL: {code: -1, name: '已取消', desc: '人工取消', color: 'rgb(200, 60, 60)'},
});

export const AssignStrategyEnum = new Enum({
    PRIORITY: {code: 1, name: '按优先级', desc: '按员工优先级分配', color: 'rgb(68, 117, 80)'},
    PROXIMITY: {code: 2, name: '临近工作', desc: '按工作时间相近分配', color: 'rgb(52, 152, 219)'},
    BALANCED: {code: 3, name: '平均承担', desc: '按工作量平均分配', color: 'rgb(155, 89, 182)'},
});

// 本站预约及其子渠道统一使用同一颜色
const OWN_SITE_COLOR = 'rgb(211, 95, 33)'

export const BookSourceEnum = new Enum({
    NATURAL: {code: 1, name: '自然流', desc: '', color: 'rgb(68, 117, 80)'},
    // 原「微信/电话预约」(code 2) 拆分：存量 code=2 数据默认归为电话预约（无需迁移），微信预约用新 code 7
    PHONE: {code: 2, name: '电话预约', desc: '', color: 'rgb(52, 152, 219)'},
    WECHAT: {code: 7, name: '微信预约', desc: '', color: 'rgb(7, 193, 96)'},
    CLASSPASS: {code: 3, name: 'classpass', desc: '', color: 'rgb(155, 89, 182)'},
    BUILDHEALTH: {code: 4, name: 'buildhealth', desc: '', color: 'rgb(230, 126, 34)'},
    AI: {code: 5, name: 'AI预约', desc: '', color: 'rgb(26, 188, 156)'},
    OWN_SITE: {code: 6, name: '本站预约', desc: '', color: OWN_SITE_COLOR},
    OWN_SITE_TK: {code: 61, name: '本站预约-Tk', desc: '', color: OWN_SITE_COLOR},
    OWN_SITE_FB: {code: 62, name: '本站预约-Fb', desc: '', color: OWN_SITE_COLOR},
    OWN_SITE_INS: {code: 63, name: '本站预约-Ins', desc: '', color: OWN_SITE_COLOR},
    OWN_SITE_YTB: {code: 64, name: '本站预约-Ytb', desc: '', color: OWN_SITE_COLOR},
    UNKNOW: {code: 100, name: '其他预约', desc: '', color: 'rgb(128, 128, 128)'},
});

// 预约邮件处理状态
export const BookEmailStatusEnum = new Enum({
    UNPROCESSED: {code: 0, name: '未处理', desc: '刚落库，或处理过程中出现瞬时异常，可被重试', color: 'rgb(245, 166, 35)'},
    PROCESSED: {code: 1, name: '已处理', desc: '解析为预约/取消并成功落库', color: 'rgb(68, 117, 80)'},
    FAILED: {code: -1, name: '处理失败', desc: '判定为预约/取消，但落库失败', color: 'rgb(200, 60, 60)'},
    NO_NEED: {code: -2, name: '无需处理', desc: '广告邮件或其他非预约邮件', color: 'rgb(128, 128, 128)'},
});

// 大模型对邮件意图的判定结果
export const EmailIntentEnum = new Enum({
    IGNORE: {code: 0, name: '无需处理', desc: '广告/其他非预约邮件', color: 'rgb(128, 128, 128)'},
    BOOKING: {code: 1, name: '预约', desc: '预约邮件', color: 'rgb(68, 117, 80)'},
    CANCEL: {code: 2, name: '取消预约', desc: '取消预约邮件', color: 'rgb(230, 126, 34)'},
});
