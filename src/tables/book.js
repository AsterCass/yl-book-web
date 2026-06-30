/*
* [官方]
* name：当前列code，唯一id同表不重复。用于指定表的主键id、指定自定义槽等功能
* required（可选）：使用visible-columns属性后，该列仍然显示
* label：实际显示在雇员界面该行的文字
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

const tableBookCol = [
    {
        name: 'id',
        field: 'id',
        label: '预约编号',
        align: 'center',
    },
    {
        name: 'name',
        field: 'name',
        label: '客户名称',
        align: 'center',
    },
    {
        name: 'phone',
        field: 'phone',
        label: '客户手机号',
        align: 'center',
    },
    {
        name: 'mail',
        field: 'mail',
        label: '客户邮箱',
        align: 'center',
    },
    {
        name: 'bookingTime',
        field: 'bookingTime',
        label: '预约时间',
        align: 'center',
    },
    {
        name: 'bookProjectNames',
        field: 'bookProjectNames',
        label: '预约项目',
        align: 'center',
        type: ComplexTableColumnTypeEnum.MULTI_ROW,
    },
    {
        name: 'sourceName',
        field: 'sourceName',
        label: '预约来源',
        align: 'center',
    },
    {
        name: 'statusName',
        field: 'statusName',
        label: '预约状态',
        align: 'center',
        type: ComplexTableColumnTypeEnum.ICON_COLOR,
    },
    {
        name: 'staffName',
        field: 'staffName',
        label: '服务人员',
        align: 'center',
        type: ComplexTableColumnTypeEnum.POINT,
    },
    {
        name: 'createTime',
        field: 'createTime',
        label: '创建时间',
        align: 'center',
    },
    {
        name: 'createUserName',
        field: 'createUserName',
        label: '创建用户',
        align: 'center',
    },
    {
        name: 'remark',
        field: 'remark',
        label: '备注',
        align: 'center',
    },
    {
        name: 'operation',
        field: 'operation',
        label: '操作',
        align: 'center',
    },
]

/**
 * [官方]
 * tableColumns：列配置
 * tableKey：表单唯一键
 * selectType：行选择类型，可选项：none, single, multiple
 *
 * [自定义]
 * showFullSize：默认false，支持表格全屏
 * showTableSetting：默认false，支持自定义显示列
 */
export const tableBook = {
    tableColumns: tableBookCol,
    tableKey: "id",
    selectType: 'none',
    showFullSize: true,
    showTableSetting: true,
}

/**
 * 当 tableColumns 包含 operation 属性生效
 * [自定义]
 * label：展示在操作列的操作文字内容
 * condition：出现条件，比如出现条件为 'cod', 那么只有在该行数据 thisData.cod 判断为 true 的时候才会显示
 * name：在雇员点击时候，会将该字段值传回，用于确定哪个label被点击
 * color: 按钮颜色
 */
export const tableBookOperation = [
    {
        label: '编辑',
        condition: 'updateOp',
        name: 'update',
    },
    {
        label: '分配员工',
        condition: 'assignOp',
        name: 'assign',
    },
    {
        label: '重新分配',
        condition: 'reassignOp',
        name: 'assign',
    },
    {
        label: '取消预约',
        condition: 'deleteOp',
        name: 'delete',
        color: 'rgb(var(--negative))',
    },
]
