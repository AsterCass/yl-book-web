/*
* [官方]
* name：当前列code，唯一id同表不重复。用于指定表的主键id、指定自定义槽等功能
* required（可选）：使用visible-columns属性后，该列仍然显示
* label：实际显示在界面该行的文字
* align（可选，默认 'right' ）：当前列框中数据的校准位置
* field：绑定数据字段，一般和name相同
*
* [自定义]
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
        align: 'center',
    },
    {
        name: 'title',
        field: 'title',
        label: '邮件标题',
        align: 'center',
    },
    {
        name: 'fromMail',
        field: 'fromMail',
        label: '发件邮箱',
        align: 'center',
    },
    {
        name: 'toMail',
        field: 'toMail',
        label: '收件邮箱',
        align: 'center',
    },
    {
        name: 'intentName',
        field: 'intentName',
        label: '判定意图',
        align: 'center',
        type: ComplexTableColumnTypeEnum.ICON_COLOR,
    },
    {
        name: 'statusName',
        field: 'statusName',
        label: '处理状态',
        align: 'center',
        type: ComplexTableColumnTypeEnum.ICON_COLOR,
    },
    {
        name: 'sourceName',
        field: 'sourceName',
        label: '来源',
        align: 'center',
    },
    {
        name: 'retryCount',
        field: 'retryCount',
        label: '重试次数',
        align: 'center',
    },
    {
        name: 'createTime',
        field: 'createTime',
        label: '接收时间',
        align: 'center',
    },
    {
        name: 'operation',
        field: 'operation',
        label: '操作',
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
        condition: 'emailDetailOp',
        name: 'emailDetail',
    },
    {
        label: '预约详情',
        condition: 'bookDetailOp',
        name: 'bookDetail',
    },
]
