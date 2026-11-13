import {i18n} from '@/i18n'

/**
 * 枚举：{KEY: {code, name, desc, color}}。{@code Enum.KEY}、{@code fromCode}、{@code getAll} 拿到的是同一个对象（带 key）。
 * <p>
 * 显示名多语言（2026-11-13）：传了 {@code i18nPrefix} 时 {@code name} 是 getter，每次读取按当前界面语言取
 * {@code `${i18nPrefix}.${KEY}`}（en.json / zh.json 的 enum 分区），缺翻译回退这里写的原文。
 * <ul>
 *   <li>在模板 / computed 里读 {@code .name}：随语言切换即时更新；</li>
 *   <li>{@code toSelectForm} / {@code fromCodeToSelectFrom} 的 {@code label} 也是 getter：下拉选项与已选值的显示名同样即时更新，
 *       {@code ref(XEnum.toSelectForm())} 照旧用；</li>
 *   <li>取数时写进行数据的（{@code data.xxxName = e.name}）是当时语言的快照：这类页面在语言切换时重新取当前页
 *       （{@code watch(locale, () => selectData(true))}）。</li>
 * </ul>
 * {@code desc} 只作代码注释用、界面不显示，不翻译。
 */
export class Enum {
    constructor(enumMap, i18nPrefix) {
        this.enumMap = new Map();
        this.codeMap = new Map();

        for (const [key, raw] of Object.entries(enumMap)) {
            const value = {...raw, key};
            if (i18nPrefix) {
                const i18nKey = `${i18nPrefix}.${key}`;
                Object.defineProperty(value, 'name', {
                    enumerable: true,
                    get: () => i18n.global.te(i18nKey) ? i18n.global.t(i18nKey) : raw.name,
                });
            }
            this[key] = value;
            this.enumMap.set(key, value);
            this.codeMap.set(value.code, value);
        }
    }

    fromCode(code) {
        return this.codeMap.get(code);
    }

    fromCodeToSelectFrom(code) {
        return toSelectOption(this.codeMap.get(code));
    }

    getAll() {
        return Array.from(this.enumMap.values());
    }

    toSelectForm() {
        return this.getAll().map(toSelectOption);
    }
}

// 下拉选项 {label, value}：label 读枚举的 name（getter），随界面语言变化
function toSelectOption(item) {
    return {
        get label() {
            return item.name;
        },
        value: item.code,
    };
}

/** 枚举查不到时的显示名（随界面语言）。 */
export function enumUnknownName() {
    return i18n.global.t('enum.unknown');
}


// 门店时区，code 为 IANA 时区标识
export const TimezoneOptEnum = new Enum({
    SHANGHAI: {code: 'Asia/Shanghai', name: '上海', desc: '', color: ''},
    NEW_YORK: {code: 'America/New_York', name: '纽约', desc: '', color: ''},
    CALIFORNIA: {code: 'America/Los_Angeles', name: '加州', desc: '', color: ''},
}, 'enum.timezone');

export const CommonStatusEnum = new Enum({
    NORMAL: {code: 0, name: '正常', desc: '', color: 'rgb(68, 117, 80)'},
    DISABLE: {code: 1, name: '禁用', desc: '', color: 'rgb(200, 60, 60)'},
    LOCKED: {code: 2, name: '锁定', desc: '', color: 'rgb(245, 166, 35)'}
}, 'enum.common_status');

export const PermissionTypeEnum = new Enum({
    NORMAL: {code: 1, name: '页面', desc: '', color: 'rgb(68, 117, 80)'},
    DISABLE: {code: 2, name: '按钮', desc: '', color: 'rgb(166, 133, 44)'},
    LOCKED: {code: 3, name: '接口', desc: '', color: 'rgb(142, 68, 173)'}
}, 'enum.permission_type');

// 待办层级：1=用户级 2=租户级 3=门店级
export const TodoLevelEnum = new Enum({
    USER: {code: 1, name: '用户', desc: '', color: 'rgb(68, 117, 80)'},
    TENANT: {code: 2, name: '租户', desc: '', color: 'rgb(142, 68, 173)'},
    STORE: {code: 3, name: '门店', desc: '', color: 'rgb(166, 133, 44)'}
}, 'enum.todo_level');

export const GenderOptEnum = new Enum({
    FEMALE: {
        code: 0, name: '女', color: 'pink-7', desc: ''
    }, MALE: {
        code: 1, name: '男', color: 'blue-7', desc: ''
    }, LESBIAN: {
        code: 2, name: '女同性恋', color: 'deep-purple-7', desc: ''
    }, GAY: {
        code: 3, name: '男同性恋', color: 'green-7', desc: ''
    }, BISEXUAL: {
        code: 4, name: '双性恋', color: 'purple-7', desc: ''
    }, TRANSGENDER: {
        code: 5, name: '跨性别', color: 'light-green-7', desc: ''
    }, QUEER: {
        code: 6, name: '酷儿', color: 'teal-7', desc: ''
    }, HELICOPTER: {
        code: 7, name: '武装直升飞机', color: 'grey-10', desc: ''
    }, WALMART_BAG: {
        code: 8, name: '沃尔玛购物袋', color: 'blue-grey-7', desc: ''
    }
}, 'enum.gender');



