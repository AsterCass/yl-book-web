export const ComplexTableColumnTypeEnum = Object.freeze({
    DEFAULT: 0,
    POINT: 1,
    ICON_COLOR: 2,
    IMAGE: 3,
    MULTI_ROW: 4,
    // 长文本：渲染换行符（pre-wrap），限制最大宽度（列配置 maxWidth，默认 20rem）
    TEXT: 5,
});

export const ComplexTableColumnIconSiteEnum = Object.freeze({
    START: 0,
    End: 1,
});

export const ComplexTableSortedStatus = Object.freeze({
    DEFAULT: 0,
    ASC: 1,
    DESC: 2,
});