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
    NORMAL: {code: 0, name: '正常', desc: ''},
    DISABLE: {code: 1, name: '禁用', desc: ''},
    LOCKED: {code: 2, name: '锁定', desc: ''}
});

export const PermissionTypeEnum = new Enum({
    NORMAL: {code: 1, name: '页面', desc: ''},
    DISABLE: {code: 2, name: '按钮', desc: ''},
    LOCKED: {code: 3, name: '接口', desc: ''}
});



