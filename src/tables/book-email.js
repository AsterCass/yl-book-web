/*
* [官方]
* name：当前列code，唯一id同表不重复。用于指定表的主键id、指定自定义槽等功能
* required（可选）：使用visible-columns属性后，该列仍然显示
* label：实际显示在界面该行的文字
* align（可选，默认 'right' ）：当前列框中数据的校准位置
* field：绑定数据字段，一般和name相同
*
* [自定义]
* labelKey（可选）：i18n 键（en.json / zh.json 的 table 分区），有就按当前语言显示（切换语言即时生效），label 只作兜底
* sortableLite：（可选，默认false）是否支持排序（重写官方逻辑）
* cardShowLabel（可选，默认true）：卡片方式显示时，是否展示该列label
* cardSite（可选，默认 'content' ）：卡片方式显示时，该字段在卡片的位置，
*      可选项：content, title, subscript, footerRight, footerLeft, footerMiddle
* type（可选，默认 'default'）：该列渲染方式，
*      可选项：default, point, iconWithColor, image
* iconSite（可选项，默认 'start'）：type=iconWithColor有效，可选项：start, end
* imageSize（可选项，默认无限制）
*/

import {ComplexTableColumnTypeEnum} from "@/constants/enums/table.js";

const tableBookEmailCol = [
    {
        name: 'id',
        field: 'id',
        label: '邮件编号',
        labelKey: 'table.book_email.col.id',
        align: 'center',
    },
    {
        name: 'title',
        field: 'titleDisplay',
        label: '邮件标题',
        labelKey: 'table.book_email.col.title',
        align: 'center',
    },
    {
        name: 'content',
        field: 'contentDisplay',
        label: '邮件内容',
        labelKey: 'table.book_email.col.content',
        align: 'center',
    },
    {
        name: 'intentName',
        field: 'intentName',
        label: '判定意图',
        labelKey: 'table.book_email.col.intentName',
        align: 'center',
        type: ComplexTableColumnTypeEnum.ICON_COLOR,
    },
    {
        name: 'statusName',
        field: 'statusName',
        label: '处理状态',
        labelKey: 'table.book_email.col.statusName',
        align: 'center',
        type: ComplexTableColumnTypeEnum.ICON_COLOR,
    },
    {
        name: 'errorMsg',
        field: 'errorMsgDisplay',
        label: '错误原因',
        labelKey: 'table.book_email.col.errorMsg',
        align: 'center',
    },
    {
        name: 'sourceName',
        field: 'sourceName',
        label: '来源',
        labelKey: 'table.book_email.col.sourceName',
        align: 'center',
    },
    {
        name: 'retryCount',
        field: 'retryCount',
        label: '重试次数',
        labelKey: 'table.book_email.col.retryCount',
        align: 'center',
    },
    {
        name: 'createTime',
        field: 'createTime',
        label: '接收时间',
        labelKey: 'table.book_email.col.createTime',
        align: 'center',
    },
    {
        name: 'operation',
        field: 'operation',
        label: '操作',
        labelKey: 'table.book_email.col.operation',
        align: 'center',
    },
]

export const tableBookEmail = {
    tableColumns: tableBookEmailCol,
    tableKey: "id",
    selectType: 'none',
    showFullSize: true,
    showTableSetting: true,
}

/**
 * 当 tableColumns 包含 operation 属性生效
 */
export const tableBookEmailOperation = [
    {
        label: '邮件详情',
        labelKey: 'table.book_email.op.emailDetail',
        condition: 'emailDetailOp',
        name: 'emailDetail',
    },
    {
        label: '预约详情',
        labelKey: 'table.book_email.op.bookDetail',
        condition: 'bookDetailOp',
        name: 'bookDetail',
    },
    {
        label: '重试',
        labelKey: 'table.book_email.op.reparse',
        condition: 'reparseOp',
        name: 'reparse',
    },
    {
        label: '无需处理',
        labelKey: 'table.book_email.op.giveup',
        condition: 'giveupOp',
        name: 'giveup',
        color: 'rgb(var(--negative))',
    },
]
