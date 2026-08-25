import {serviceShiro} from "@/utils/request.js";

function storeHeader(storeId) {
    return storeId ? {'X-Store-Id': storeId} : undefined
}

export function storeResourceList(storeId) {
    return serviceShiro({
        url: `/book/store/resource/list`,
        method: 'get',
        headers: storeHeader(storeId),
    })
}

// body: {resourceList: [{id?, resourceName, capacity}]}; 不在列表内的已有项不会被删除
export function storeResourceSave(body, storeId) {
    return serviceShiro({
        url: `/book/store/resource/save`,
        data: body,
        method: 'post',
        headers: storeHeader(storeId),
    })
}

export function storeResourceDelete(id, storeId) {
    return serviceShiro({
        url: `/book/store/resource/delete/${id}`,
        method: 'delete',
        headers: storeHeader(storeId),
    })
}
