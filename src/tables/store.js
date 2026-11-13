/*
* [官方]
* name：当前列code，唯一id同表不重复。用于指定表的主键id、指定自定义槽等功能
* required（可选）：使用visible-columns属性后，该列仍然显示
* label：实际显示在用户界面该行的文字
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

const tableStoreCol = [
    {
        name: 'name',
        field: 'name',
        label: '门店名称',
        labelKey: 'table.store.col.name',
        align: 'center',
    },
    {
        name: 'externalName',
        field: 'externalName',
        label: '外部名称',
        labelKey: 'table.store.col.externalName',
        align: 'center',
    },
    {
        name: 'externalNameZh',
        field: 'externalNameZh',
        label: '外部名称（中文）',
        labelKey: 'table.store.col.externalNameZh',
        align: 'center',
    },
    {
        name: 'address',
        field: 'address',
        label: '门店地址',
        labelKey: 'table.store.col.address',
        align: 'center',
    },
    {
        name: 'addressZh',
        field: 'addressZh',
        label: '门店地址（中文）',
        labelKey: 'table.store.col.addressZh',
        align: 'center',
    },
    {
        name: 'phone',
        field: 'phone',
        label: '门店电话',
        labelKey: 'table.store.col.phone',
        align: 'center',
    },
    {
        // AI 电话：对客公布的 AI 接听号码。客户端展示门店电话时优先用它，为空才回退上面的门店电话
        name: 'aiPhone',
        field: 'aiPhone',
        label: 'AI 电话',
        labelKey: 'table.store.col.aiPhone',
        align: 'center',
    },
    {
        // 呼出电话：本店已购的 Twilio 号码，回访客户（电话需求页「拨打电话」）时的主叫显示；
        // 未配置该店不能发起回访
        name: 'outboundPhone',
        field: 'outboundPhone',
        label: '呼出电话',
        labelKey: 'table.store.col.outboundPhone',
        align: 'center',
    },
    {
        name: 'timezoneName',
        field: 'timezoneName',
        label: '门店时区',
        labelKey: 'table.store.col.timezoneName',
        align: 'center',
    },
    {
        name: 'statusName',
        field: 'statusName',
        label: '门店状态',
        labelKey: 'table.store.col.statusName',
        align: 'center',
        type: ComplexTableColumnTypeEnum.ICON_COLOR,
    },
    {
        name: 'operation',
        field: 'operation',
        label: '操作',
        labelKey: 'table.store.col.operation',
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
        labelKey: 'table.store.op.update',
        condition: 'updateOp',
        name: 'update',
    },
    {
        label: '特殊备注',
        labelKey: 'table.store.op.remark',
        condition: 'remarkOp',
        name: 'remark',
    },
]
