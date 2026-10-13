// 手动短信的实时计数与预览。只是页面上的近似提示——发送前以后端预览接口（/sms/preview）返回的为准。
// 算法与 yl-book 的 BookSmsComposer.cleanManualText / measure 一致，改一边记得改另一边。

// GSM 03.38 基本字符集 + 扩展表。扩展表里的字符仍是 GSM 编码，但各占两个七位组
const GSM_CHARS = "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿"
    + "abcdefghijklmnopqrstuvwxyzäöñüà^{}\\[~]|€"
const GSM_EXT_CHARS = "^{}\\[~]|€"

// 常见排版字符换成 ASCII：一个弯引号就会让整条短信按 70 字一段计费
export function smsTypography(text) {
    return (text || '')
        .replace(/[‘’‚]/g, "'")
        .replace(/[“”„]/g, '"')
        .replace(/[–—−]/g, '-')
        .replace(/…/g, '...')
        .replace(/[ \t]/g, ' ')
}

// 店员写的正文在发送前的整理：排版字符、换行统一、去掉看不见的控制字符与零宽空格、行尾空格与多余空行、首尾空白。
// 不删中文等非 GSM 字符
export function smsCleanText(text) {
    const s = smsTypography(text)
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        // eslint-disable-next-line no-control-regex
        .replace(/[\u0000-\u0009\u000B-\u001F\u007F-\u009F​﻿]/g, '')
    return s.replace(/ +\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()
}

// 一段正文按短信编码后的大小：{gsm, units, segments}。
// GSM-7：一段 160、多段每段 153（扩展表字符算两个）；只要有一个字符不在 GSM 表里，整条按 UCS-2：一段 70、多段每段 67
export function smsMeasure(body) {
    const s = body || ''
    let septets = 0
    let gsm = true
    for (let i = 0; i < s.length; i++) {
        const c = s.charAt(i)
        if (GSM_CHARS.indexOf(c) < 0) {
            gsm = false
            break
        }
        septets += GSM_EXT_CHARS.indexOf(c) >= 0 ? 2 : 1
    }
    if (gsm) {
        return {gsm: true, units: septets, segments: septets <= 160 ? 1 : Math.ceil(septets / 153)}
    }
    const units = s.length
    return {gsm: false, units, segments: units <= 70 ? 1 : Math.ceil(units / 67)}
}

// 10 位美加号码显示成 (XXX) XXX-XXXX，其它原样
export function smsDisplayPhone(national) {
    if (!national || national.length !== 10) {
        return national || ''
    }
    return `(${national.substring(0, 3)}) ${national.substring(3, 6)}-${national.substring(6)}`
}

// 这通电话的来电号码能不能发短信：合法的美加号码（10 位，或带国家码 1 的 11 位）
export function smsIsUsNumber(phone) {
    return /^1?[2-9]\d{9}$/.test((phone || '').replace(/\D/g, ''))
}
