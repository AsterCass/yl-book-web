import {serviceShiro} from '@/utils/request'


export function audioInput(form) {
    return serviceShiro({
        url: `/audio/input`,
        method: 'post',
        data: form,
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    })
}


export function audioOutput(session_id) {
    return serviceShiro({
        url: `/audio/output?session_id=${session_id}`,
        method: 'get',
        responseType: 'arraybuffer',
    })
}

