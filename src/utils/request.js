import axios from 'axios'
import Qs from 'qs'
import {notifyTopWarning} from "@/utils/notification-tools";
import i18n from '@/i18n';
import {useGlobalStateStore} from "@/utils/global-state";

const t = i18n.global.t
const BASE_ADD = import.meta.env.VITE_APP_BASE_ADD


const requestConfig = config => {
    const globalState = useGlobalStateStore()
    config.headers.set('User-Token', globalState.loginToken)
    return config
}

const responseConfig = response => {
    if (response && 200 !== response.status) {
        // notifyTopWarning(t('error_request'))
        return null
    }
    return response;
}
const responseErrorConfig = error => {
    if (error.status === 429) {
        notifyTopWarning(t('error_request_429'))
    } else {
        // notifyTopWarning(t('error_request'))
    }
    return undefined
}


const serviceShiro = axios.create({
    baseURL: BASE_ADD,
    timeout: 20000,
    paramsSerializer: {
        paramsSerializer: function (params) {
            return Qs.stringify(params, {arrayFormat: 'repeat'})
        }
    }
})

// serviceShiro.interceptors.request.use(requestConfig)

serviceShiro.interceptors.response.use(responseConfig, responseErrorConfig)


export {
    serviceShiro
}