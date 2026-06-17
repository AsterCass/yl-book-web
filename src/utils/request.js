import axios from 'axios'
import Qs from 'qs'
import {notifyTopWarning} from "@/utils/notification-tools";
import {i18n} from '@/i18n';
import {deleteCookie} from "@/utils/common.js";
import router, {backToLogin} from '@/router'

const t = i18n.global.t
const BASE_ADD = import.meta.env.VITE_APP_BASE_ADD


const responseConfig = response => {
    if (response && 200 === response.status) {
        const serverData = response.data
        let bizStatus = 0
        if (serverData instanceof Object) {
            bizStatus = serverData.status
            if (600 === bizStatus) {
                notifyTopWarning(t('no_login'))
                deleteCookie()
                backToLogin(router)
                return null
            }
            if (400 === bizStatus) {
                notifyTopWarning(t('error_request'))
                return null
            }
            if (bizStatus >= 500) {
                notifyTopWarning(serverData.message)
                return null
            }
        }
    } else {
        notifyTopWarning(t('error_request'))
        return null
    }
    return response;
}


const responseErrorConfig = error => {
    if (error.status === 429) {
        notifyTopWarning(t('error_request_429'))
    } else {
        notifyTopWarning(t('error_request'))
    }
    return undefined
}


const serviceShiro = axios.create({
    baseURL: BASE_ADD,
    // allow cookies (Set-Cookie) to be stored when server responds
    // required when backend and frontend are on different origins and server
    // sends cookies for authentication/session
    withCredentials: true,
    timeout: 20000,
    paramsSerializer: {
        paramsSerializer: function (params) {
            return Qs.stringify(params, {arrayFormat: 'repeat'})
        }
    }
})

serviceShiro.interceptors.response.use(responseConfig, responseErrorConfig)


export {
    serviceShiro
}