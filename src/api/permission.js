import {serviceShiro} from "@/utils/request.js";


export function perList(params) {
    return serviceShiro({
        url: `/permission/list`,
        params: params,
        method: 'get',
    })
}