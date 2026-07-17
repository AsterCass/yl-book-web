/*
* [官方]
* name：当前列code，唯一id同表不重复。用于指定表的主键id、指定自定义槽等功能
* required（可选）：使用visible-columns属性后，该列仍然显示
* label：实际显示在用户界面该行的文字
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

const tableStoreCol = [
    {
        name: 'id',
        field: 'id',
        label: '门店编号',
        align: 'center',
    },
    {
        name: 'name',
        field: 'name',
        label: '门店名称',
        align: 'center',
    },
    {
        name: 'externalName',
        field: 'externalName',
        label: '外部名称',
        align: 'center',
    },
    {
        name: 'address',
        field: 'address',
        label: '门店地址',
        align: 'center',
    },
    {
        name: 'phone',
        field: 'phone',
        label: '门店电话',
        align: 'center',
    },
    {
        name: 'description',
        field: 'description',
        label: '门店描述',
        align: 'center',
    },
    {
        name: 'timezoneName',
        field: 'timezoneName',
        label: '门店时区',
        align: 'center',
    },
    {
        name: 'statusName',
        field: 'statusName',
        label: '门店状态',
        align: 'center',
        type: ComplexTableColumnTypeEnum.ICON_COLOR,
    },
    {
        name: 'createTime',
        field: 'createTime',
        label: '创建时间',
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
export const tableStore = {
    tableColumns: tableStoreCol,
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
 * name：在用户点击时候，会将该字段值传回，用于确定哪个label被点击
 * color: 按钮颜色
 */
export const tableStoreOperation = [
    {
        label: '编辑',
        condition: 'updateOp',
        name: 'update',
    },
    {
        label: '特殊备注',
        condition: 'remarkOp',
        name: 'remark',
    },
]
