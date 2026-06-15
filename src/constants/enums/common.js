class Enum {
    constructor(enumMap) {
        this.enumMap = new Map();
        this.codeMap = new Map();

        for (const [key, value] of Object.entries(enumMap)) {
            this[key] = value;
            this.enumMap.set(key, value);
            this.codeMap.set(value.code, {key, ...value});
        }
    }

    fromCode(code) {
        return this.codeMap.get(code);
    }

    fromCodeToSelectFrom(code) {
        const thisEnum = this.codeMap.get(code);
        return {
            label: thisEnum.name,
            value: thisEnum.code
        };
    }

    getAll() {
        return Array.from(this.enumMap.values());
    }

    toSelectForm() {
        return Array.from(this.enumMap.values()).map(item => ({
            label: item.name,
            value: item.code
        }));
    }
}


export const CommonStatusEnum = new Enum({
    NORMAL: {code: 0, name: '正常', desc: '', color: 'rgb(68, 117, 80)'},
    DISABLE: {code: 1, name: '禁用', desc: '', color: 'rgb(200, 60, 60)'},
    LOCKED: {code: 2, name: '锁定', desc: '', color: 'rgb(245, 166, 35)'}
});

export const PermissionTypeEnum = new Enum({
    NORMAL: {code: 1, name: '页面', desc: '', color: 'rgb(68, 117, 80)'},
    DISABLE: {code: 2, name: '按钮', desc: '', color: 'rgb(166, 133, 44)'},
    LOCKED: {code: 3, name: '接口', desc: '', color: 'rgb(142, 68, 173)'}
});



