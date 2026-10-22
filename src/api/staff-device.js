import {serviceShiro} from "@/utils/request.js";

// 门店一体机（AI 数字人前台）设备：接口均按门店隔离（同 /staff/skill，X-Tenant-Id / X-Store-Id 由请求拦截器携带）

// params: {id?, name?, status?, pageNo, pageSize}；返回分页 {records, total}
export function staffDeviceList(params) {
    return serviceShiro({
        url: `/staff/device/list`,
        params: params,
        method: 'get',
    })
}

export function staffDeviceDetail(id) {
    return serviceShiro({
        url: `/staff/device/detail/${id}`,
        method: 'get',
    })
}

// body: {name, remark?, status}；设备建在当前门店；返回 {id}（密钥在列表里看）
export function staffDeviceCreate(body) {
    return serviceShiro({
        url: `/staff/device/create`,
        data: body,
        method: 'post',
    })
}

// body 同创建（设备不能换店）
export function staffDeviceUpdate(id, body) {
    return serviceShiro({
        url: `/staff/device/update/${id}`,
        data: body,
        method: 'post',
    })
}

// 物理删除
export function staffDeviceDelete(id) {
    return serviceShiro({
        url: `/staff/device/delete/${id}`,
        method: 'delete',
    })
}

// 返回 {deviceKey}（新密钥）；旧密钥立即失效
export function staffDeviceResetKey(id) {
    return serviceShiro({
        url: `/staff/device/reset-key/${id}`,
        method: 'post',
    })
}
