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

// 解锁因设备密钥错太多被锁的 IP（设备收到 706）：body {ip}
export function staffDeviceUnlockIp(ip) {
    return serviceShiro({
        url: `/staff/device/unlock-ip`,
        data: {ip},
        method: 'post',
    })
}

// 下发配置的白名单：[{key, type(STRING/URL/PIN), secret, desc, maxLength}]，按表单顺序
export function staffDeviceConfigKeys() {
    return serviceShiro({
        url: `/staff/device/config/keys`,
        method: 'get',
    })
}

// 一台设备的配置：返回 {deviceId, itemList[{key, value}]}；密钥不给原文：设了为 null，没设为空串
export function staffDeviceConfig(id) {
    return serviceShiro({
        url: `/staff/device/config/${id}`,
        method: 'get',
    })
}

// 改一台设备的配置：values {key: value | null}，只动出现的 key，null = 删掉这一项；返回改完后的配置（同上）
export function staffDeviceConfigUpdate(id, values) {
    return serviceShiro({
        url: `/staff/device/config/${id}`,
        data: {values},
        method: 'post',
    })
}
