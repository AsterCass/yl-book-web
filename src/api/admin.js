import {serviceShiro} from "@/utils/request.js";


export function todoList() {
    return serviceShiro({
        url: `/admin/todo/list`,
        method: 'get',
    })
}
