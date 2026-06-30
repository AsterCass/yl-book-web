import {Enum} from "@/constants/enums/common.js";

export const BookStatusEnum = new Enum({
    PENDING: {code: 0, name: '待分配', desc: '等待分配服务人员', color: 'rgb(245, 166, 35)'},
    ASSIGNED: {code: 1, name: '已分配', desc: '已分配服务人员', color: 'rgb(68, 117, 80)'},
    CANCELLED: {code: -1, name: '已取消', desc: '预约已取消', color: 'rgb(200, 60, 60)'},
});

export const AssignStrategyEnum = new Enum({
    PRIORITY: {code: 1, name: '按优先级', desc: '按员工优先级分配', color: 'rgb(68, 117, 80)'},
    PROXIMITY: {code: 2, name: '临近工作', desc: '按工作时间相近分配', color: 'rgb(52, 152, 219)'},
    BALANCED: {code: 3, name: '平均承担', desc: '按工作量平均分配', color: 'rgb(155, 89, 182)'},
});

export const BookSourceEnum = new Enum({
    NATURAL: {code: 1, name: '自然流', desc: '', color: 'rgb(68, 117, 80)'},
    WECHAT: {code: 2, name: '微信/电话预约', desc: '', color: 'rgb(52, 152, 219)'},
    CLASSPASS: {code: 3, name: 'classpass', desc: '', color: 'rgb(155, 89, 182)'},
    BUILDHEALTH: {code: 4, name: 'buildhealth', desc: '', color: 'rgb(230, 126, 34)'},
    AI: {code: 5, name: 'AI预约', desc: '', color: 'rgb(26, 188, 156)'},
    OWN_SITE: {code: 6, name: '本站预约', desc: '', color: 'rgb(241, 196, 15)'},
});
