import {i18n} from '@/i18n'
import {smsDisplayPhone} from "@/utils/sms.js";
import {PhoneRequestHandleStatusEnum} from "@/constants/enums/book.js";

// 电话需求的联系电话库里存 11 位（1 + 10 位美加号码）：去掉国家码后按 (XXX) XXX-XXXX 显示，其它原样
export function phoneRequestDisplayPhone(phone) {
    const digits = (phone || '').replace(/\D/g, '')
    const national = digits.length === 11 && digits.startsWith('1') ? digits.substring(1) : digits
    return national.length === 10 ? smsDisplayPhone(national) : (phone || '')
}

// 处理状态显示名：走 i18n（book_phone_request.status.<枚举键>，随界面语言），枚举里的中文 name 只作兜底。
// 在模板 / computed 里调用即随语言切换更新（i18n 为 composition 模式，locale 是响应式的）
export function phoneRequestStatusName(code) {
    const statusEnum = PhoneRequestHandleStatusEnum.fromCode(code)
    if (!statusEnum) {
        return ''
    }
    const key = 'book_phone_request.status.' + statusEnum.key
    return i18n.global.te(key) ? i18n.global.t(key) : statusEnum.name
}

// 处理状态下拉选项 {label, value}（label 同上走 i18n）；excludeCodes 里的状态不列出
export function phoneRequestStatusOptions(excludeCodes = []) {
    return PhoneRequestHandleStatusEnum.getAll()
        .filter(item => !excludeCodes.includes(item.code))
        .map(item => ({label: phoneRequestStatusName(item.code), value: item.code}))
}
