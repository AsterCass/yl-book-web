import {serviceShiro} from "@/utils/request.js";

export function bookList(params) {
    return serviceShiro({
        url: `/book/list`,
        params: params,
        method: 'get',
    })
}

// 预约日历：不分页，返回 { list: [预约...], blockList: [{id, staffId, storeBlock, startTime, endTime, reason}...] }
// startDateStr / endDateStr 为必传（本周一 ~ 本周日，格式 yyyy-MM-dd）
export function bookCalendar(params) {
    return serviceShiro({
        url: `/book/calendar`,
        params: params,
        method: 'get',
    })
}

export function bookCreate(body) {
    return serviceShiro({
        url: `/book/create`,
        data: body,
        method: 'post',
    })
}

export function bookUpdate(id, body) {
    return serviceShiro({
        url: `/book/update/${id}`,
        data: body,
        method: 'post',
    })
}

export function bookDelete(id) {
    return serviceShiro({
        url: `/book/delete/${id}`,
        method: 'delete',
    })
}

// 导出预约 xlsx（条件同列表，不分页，超 3000 行后端报错）：blob 响应；
// 后端业务错误时返回 JSON（调用方需按 blob.type 区分）
export function bookExport(params) {
    return serviceShiro({
        url: `/book/export`,
        params: params,
        method: 'get',
        responseType: 'blob',
    })
}

// storeId 可选：总门店视角（未选定门店）下按数据行所属门店携带 X-Store-Id 调用
//（/book/detail 要求门店上下文；已选定门店时请求拦截器会用当前门店覆盖，语义一致）
export function bookDetail(id, storeId) {
    return serviceShiro({
        url: `/book/detail/${id}`,
        method: 'get',
        headers: storeId ? {'X-Store-Id': storeId} : undefined,
    })
}

// 前台签到标记（checkIn）：仅作展示标记，不联动其他逻辑
export function bookCheckin(id) {
    return serviceShiro({
        url: `/book/checkin/${id}`,
        method: 'post',
    })
}

export function bookUncheckin(id) {
    return serviceShiro({
        url: `/book/uncheckin/${id}`,
        method: 'post',
    })
}

// 办卡信息（会员储值卡充值记录，第三方接口有限流，用户确认后才查询；不分页，一次返回全部）
// params: {startDateStr, endDateStr, sourceList?}；门店身份查本店，租户级（总门店）跨自己有权限的全部门店
export function bookCardInfo(params) {
    return serviceShiro({
        url: `/book/cardInfo`,
        params: params,
        method: 'get',
    })
}

// 导出办卡信息 xlsx（与查询同一条链路，含第三方调用与其限流约束；列与列表一致）：blob 响应
export function bookCardInfoExport(params) {
    return serviceShiro({
        url: `/book/cardInfo/export`,
        params: params,
        method: 'get',
        responseType: 'blob',
    })
}

// 客户反馈（服务评价）列表：分页，仅返回已到可见时间的反馈（匿名 = 提交后 1-3 天随机延迟）
// params: {pageNo, pageSize}
export function bookFeedbackList(params) {
    return serviceShiro({
        url: `/book/feedback/list`,
        params: params,
        method: 'get',
    })
}

// 反馈对应的预约详情（匿名反馈同样返回，独立权限 book:feedback:detail）
// 不需要门店上下文：后端按反馈 id 在可见门店范围内定位其所属门店
export function bookFeedbackDetail(id) {
    return serviceShiro({
        url: `/book/feedback/detail/${id}`,
        method: 'get',
    })
}

// 反馈处理状态流转：0=未处理 / 1=已处理 / 2=无需处理
export function bookFeedbackHandle(id, handleStatus) {
    return serviceShiro({
        url: `/book/feedback/handle/${id}`,
        params: {handleStatus: handleStatus},
        method: 'post',
    })
}

// 编辑反馈运营备注（跟进记录/处理说明）：body {remark}，传空串=清空
export function bookFeedbackRemark(id, body) {
    return serviceShiro({
        url: `/book/feedback/remark/${id}`,
        data: body,
        method: 'post',
    })
}

// 导出反馈 xlsx（条件同列表，不分页）：blob 响应；后端业务错误时返回 JSON（调用方需按 blob.type 区分）
export function bookFeedbackExport(params) {
    return serviceShiro({
        url: `/book/feedback/export`,
        params: params,
        method: 'get',
        responseType: 'blob',
    })
}

// 回访拨号（Twilio 回拨桥接）：先拨该需求所属门店的呼出电话接通店员，店员接起后自动拨通客户
// 独立权限 book:book:call；前端点击前必须二次确认，避免误呼
export function bookPhoneRequestCall(id) {
    return serviceShiro({
        url: `/book/phone-request/call/${id}`,
        method: 'post',
    })
}

// 电话需求（AI 电话记录的非预约类客户诉求）列表：分页，可见门店范围内
// params: {pageNo, pageSize, startDateStr, endDateStr, handleStatus}
export function bookPhoneRequestList(params) {
    return serviceShiro({
        url: `/book/phone-request/list`,
        params: params,
        method: 'get',
    })
}

// 电话需求统一编辑（编辑弹窗一次提交）：body {handleStatus, remark, comment}。
// handleStatus：0=未处理 / 1=已处理 / 2=无需处理 / 3=处理中；
// remark 仅内部可见，comment 客户可见（AI 电话查询会读给客户）；空=清空
export function bookPhoneRequestUpdate(id, body) {
    return serviceShiro({
        url: `/book/phone-request/update/${id}`,
        data: body,
        method: 'post',
    })
}

// block（不接受新预约时段）：不传参默认返回尚未结束的 block（门店 + 雇员）
export function bookBlockList(params) {
    return serviceShiro({
        url: `/book/block/list`,
        params: params,
        method: 'get',
    })
}

// 创建 block：staffId 不传即门店 block；startTimeStr/endTimeStr 为 yyyy-MM-dd HH:mm
export function bookBlockCreate(body) {
    return serviceShiro({
        url: `/book/block/create`,
        data: body,
        method: 'post',
    })
}

export function bookBlockDelete(id) {
    return serviceShiro({
        url: `/book/block/delete/${id}`,
        method: 'delete',
    })
}

export function bookSpecialRemarkCreate(body) {
    return serviceShiro({
        url: `/book/specialRemark/create`,
        data: body,
        method: 'post',
    })
}

// 门店特殊备注简单列表：返回本门店全部备注文案（字符串数组）
export function bookSpecialRemarkListSimple() {
    return serviceShiro({
        url: `/book/specialRemark/list/simple`,
        method: 'get',
    })
}

// 客户历史：按手机号模糊搜索，返回最多 10 个客户（按手机号聚合），
// 每个客户含总预约次数与最近 3 次预约（含已取消，附时间/项目/来源）
export function bookCustomerHistory(phone) {
    return serviceShiro({
        url: `/book/customer/history`,
        params: {phone: phone},
        method: 'get',
    })
}

// 人工分配/改派雇员：staffId 可选，不传时等价于取消分配
export function bookAssign(id, staffId) {
    const params = {}
    if (staffId) {
        params.staffId = staffId
    }
    return serviceShiro({
        url: `/book/assign/${id}`,
        params: params,
        method: 'post',
    })
}

export function bookCancelAssign(id) {
    return serviceShiro({
        url: `/book/cancelAssign/${id}`,
        method: 'post',
    })
}

// 自动分配（对未分配预约触发系统自动分配雇员）
export function bookReassign(id) {
    return serviceShiro({
        url: `/book/reassign/${id}`,
        method: 'post',
    })
}

// 拖动调整预约：bookTimeStr 必传，staffId 可选（改派）
export function bookAdjust(id, bookTimeStr, staffId) {
    const params = {bookTimeStr}
    if (staffId) {
        params.staffId = staffId
    }
    return serviceShiro({
        url: `/book/adjust/${id}`,
        params: params,
        method: 'post',
    })
}

export function bookEmailList(params) {
    return serviceShiro({
        url: `/book/email/list`,
        params: params,
        method: 'get',
    })
}

export function bookEmailDetail(id) {
    return serviceShiro({
        url: `/book/email/detail/${id}`,
        method: 'get',
    })
}

export function bookEmailReparse(id) {
    return serviceShiro({
        url: `/book/email/reparse/${id}`,
        method: 'post',
    })
}

export function bookEmailGiveup(id) {
    return serviceShiro({
        url: `/book/email/giveup/${id}`,
        method: 'post',
    })
}
