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

// 客户反馈处理状态
export const BookFeedbackHandleStatusEnum = new Enum({
    UNHANDLED: {code: 0, name: '未处理', desc: '默认状态，待运营跟进', color: 'rgb(245, 166, 35)'},
    HANDLED: {code: 1, name: '已处理', desc: '运营已跟进处理', color: 'rgb(68, 117, 80)'},
    NO_NEED: {code: 2, name: '无需处理', desc: '无需跟进', color: 'rgb(127, 140, 141)'},
});

// 电话需求处理状态（口径同客户反馈，多一个「处理中」）；需求类型为 AI 自拟的自由文本标签，无枚举。
// 未处理与处理中均计入顶部待办；客户来电查询时 AI 会把状态转述给客户。
// CUSTOMER_CANCELED 只能由客户来电撤销时经 AI 电话入口写入，管理端选中保存会被后端拒绝
// （前端不做限制，是有意的：筛选、列表、编辑弹窗都要能显示这个状态）
export const PhoneRequestHandleStatusEnum = new Enum({
    UNHANDLED: {code: 0, name: '未处理', desc: '默认状态，待运营跟进', color: 'rgb(245, 166, 35)'},
    IN_PROGRESS: {code: 3, name: '处理中', desc: '运营正在跟进，尚未办结', color: 'rgb(74, 124, 168)'},
    HANDLED: {code: 1, name: '已处理', desc: '运营已跟进处理', color: 'rgb(68, 117, 80)'},
    NO_NEED: {code: 2, name: '无需处理', desc: '无需跟进', color: 'rgb(127, 140, 141)'},
    CUSTOMER_CANCELED: {
        code: 4, name: '客户已取消',
        desc: '客户来电主动撤销（取消原因并入详细描述）；不计入待办，运营仍可流转到其他状态',
        color: 'rgb(150, 100, 160)',
    },
});

// AI 通话复盘状态（yl_ai_call_review.review_status）：档案入库即待复盘，定时裁判跑完置已复盘 / 复盘失败；
// 运营要求重判置待重判；客户一句没说的通话标无对话、不进裁判
export const AiCallReviewStatusEnum = new Enum({
    PENDING: {code: 0, name: '待复盘', desc: '档案已入库，裁判还没跑', color: 'rgb(245, 166, 35)'},
    REVIEWED: {code: 1, name: '已复盘', desc: '评判已写入', color: 'rgb(68, 117, 80)'},
    FAILED: {code: 2, name: '复盘失败', desc: '裁判两次都出不了结论，可重判', color: 'rgb(200, 60, 60)'},
    REJUDGE: {code: 3, name: '待重判', desc: '运营要求重判，等下一轮定时任务', color: 'rgb(74, 124, 168)'},
    NO_DIALOGUE: {code: 4, name: '无对话', desc: '客户一句没说就挂了，不进裁判', color: 'rgb(127, 140, 141)'},
});

// AI 通话复盘的运营处理状态（yl_ai_call_review.ops_status），三态可任意流转
export const AiCallReviewOpsStatusEnum = new Enum({
    UNREAD: {code: 0, name: '未查看', desc: '默认', color: 'rgb(245, 166, 35)'},
    HANDLED: {code: 1, name: '已处理', desc: '运营已查看并跟进', color: 'rgb(68, 117, 80)'},
    FALSE_ALARM: {code: 2, name: '误判', desc: '运营认为裁判判错了', color: 'rgb(150, 100, 160)'},
});

// 通话结束方式（yl-phone-spring-ai 归档时判定，code 为字符串）
export const AiCallEndedByEnum = new Enum({
    CUSTOMER_HANGUP: {code: 'customer-hangup', name: '客户挂断', desc: '', color: 'rgb(74, 124, 168)'},
    AGENT_END_CALL: {code: 'agent-end_call', name: 'AI 挂断', desc: 'AI 说完再见后调 end_call', color: 'rgb(68, 117, 80)'},
    AGENT_TRANSFER: {code: 'agent-transfer', name: '转接人工', desc: '', color: 'rgb(142, 68, 173)'},
    IDLE_HANGUP: {code: 'idle-hangup', name: '静默挂断', desc: '客户长时间不回话，催问后挂断', color: 'rgb(245, 166, 35)'},
    OTHER: {code: 'other', name: '其他', desc: 'Vapi 报告的其他原因', color: 'rgb(127, 140, 141)'},
    UNKNOWN: {code: 'unknown', name: '未知', desc: '没收到结束事件，由巡检兜底归档', color: 'rgb(127, 140, 141)'},
});

// 通话的会话语言
export const AiCallLangEnum = new Enum({
    ZH: {code: 'zh', name: '中文', desc: '', color: ''},
    EN: {code: 'en', name: '英文', desc: '', color: ''},
});

// 裁判给的严重度
export const AiCallReviewSeverityEnum = new Enum({
    NONE: {code: 'none', name: '无', desc: '', color: 'rgb(127, 140, 141)'},
    MINOR: {code: 'minor', name: '轻微', desc: '', color: 'rgb(245, 166, 35)'},
    MAJOR: {code: 'major', name: '严重', desc: '', color: 'rgb(200, 60, 60)'},
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
