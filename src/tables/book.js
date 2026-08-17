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
*      可选项：default, point, iconWithColor, image, multiRow, text
* iconSite（可选项，默认 'start'）：type=iconWithColor有效，可选项：start, end
* imageSize（可选项，默认无限制）
* maxWidth（可选项，默认 '20rem'）：type=text 有效，长文本最大宽度（渲染换行符、超宽自动折行）
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
        name: 'preferredStaffName',
        field: 'preferredStaffName',
        label: '偏好员工',
        align: 'center',
    },
    {
        name: 'specialRemarks',
        field: 'specialRemarks',
        label: '特殊备注',
        align: 'center',
        type: ComplexTableColumnTypeEnum.MULTI_ROW,
    },
    {
        name: 'remark',
        field: 'remarkDisplay',
        label: '备注',
        align: 'center',
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
        label: '详情',
        condition: 'detailOp',
        name: 'detail',
    },
    {
        label: '编辑',
        condition: 'updateOp',
        name: 'update',
    },
    {
        label: '复制',
        condition: 'copyOp',
        name: 'copy',
    },
    {
        label: '配置分配',
        condition: 'configAssignOp',
        name: 'assign',
    },
    {
        label: '自动分配',
        condition: 'autoAssignOp',
        name: 'autoAssign',
    },
    {
        label: '取消预约',
        condition: 'deleteOp',
        name: 'delete',
        color: 'rgb(var(--negative))',
    },
]


// 办卡信息（充值记录查询）：按手机号归并的行，姓名/预约历史/充值明细按行展示（MULTI_ROW 按逗号拆行）
const tableCardInfoCol = [
    {
        name: 'phone',
        field: 'phone',
        label: '手机号',
        align: 'center',
    },
    {
        name: 'names',
        field: 'names',
        label: '用户名称列表',
        align: 'center',
        type: ComplexTableColumnTypeEnum.MULTI_ROW,
    },
    {
        name: 'bookLines',
        field: 'bookLines',
        label: '历史预约数据列表',
        align: 'center',
        type: ComplexTableColumnTypeEnum.MULTI_ROW,
    },
    {
        // 当前筛选区间内按交易类型聚合：充值累加、退款扣减、消费忽略
        name: 'totalRecharge',
        field: 'totalRecharge',
        label: '总充值金额',
        align: 'center',
    },
    {
        name: 'rechargeLines',
        field: 'rechargeLines',
        label: '充值数据列表',
        align: 'center',
        type: ComplexTableColumnTypeEnum.MULTI_ROW,
    },
]

export const tableCardInfo = {
    tableColumns: tableCardInfoCol,
    tableKey: "phone",
    selectType: 'none',
    showFullSize: true,
    showTableSetting: true,
    // 无分页：一次性全量展示（隐藏单页容量与分页器，保留总条数/列设置/全屏）
    noPagination: true,
}


// 客户反馈（服务评价）：匿名行的 预约ID/服务雇员名称/提交时间 由后端脱敏为空（前端同样不展示、不可点击）
const tableFeedbackCol = [
    {
        name: 'id',
        field: 'id',
        label: '反馈编号',
        align: 'center',
    },
    {
        // 门店名称：匿名行也展示（门店粒度不定位提交人，运营需知道反馈针对哪家门店）
        name: 'storeName',
        field: 'storeName',
        label: '门店名称',
        align: 'center',
    },
    {
        // 非匿名可点击查看预约详情
        name: 'bookId',
        field: 'bookId',
        label: '预约编号',
        align: 'center',
        type: ComplexTableColumnTypeEnum.POINT,
    },
    {
        // 非匿名可点击查看雇员详情
        name: 'staffName',
        field: 'staffName',
        label: '服务雇员名称',
        align: 'center',
        type: ComplexTableColumnTypeEnum.POINT,
    },
    {
        name: 'scoreShow',
        field: 'scoreShow',
        label: '客户评分',
        align: 'center',
    },
    {
        // 长文本：渲染客户换行、限宽 30rem
        name: 'content',
        field: 'content',
        label: '客户评价',
        align: 'center',
        type: ComplexTableColumnTypeEnum.TEXT,
        maxWidth: '30rem',
    },
    {
        name: 'handleStatusName',
        field: 'handleStatusName',
        label: '反馈状态',
        align: 'center',
        type: ComplexTableColumnTypeEnum.ICON_COLOR,
    },
    {
        // 运营备注：长文本渲染换行、限宽 20rem；经「编辑备注」操作维护
        name: 'remark',
        field: 'remark',
        label: '备注',
        align: 'center',
        type: ComplexTableColumnTypeEnum.TEXT,
    },
    {
        name: 'createTime',
        field: 'createTime',
        label: '提交时间',
        align: 'center',
    },
    {
        name: 'operation',
        field: 'operation',
        label: '操作',
        align: 'center',
    },
]

export const tableFeedback = {
    tableColumns: tableFeedbackCol,
    tableKey: "id",
    selectType: 'none',
    showFullSize: true,
    showTableSetting: true,
}

export const tableFeedbackOperation = [
    {
        label: '详情',
        condition: 'detailOp',
        name: 'showBookDetail',
    },
    {
        label: '编辑备注',
        condition: 'remarkOp',
        name: 'editRemark',
    },
    {
        label: '标记已处理',
        condition: 'handledOp',
        name: 'markHandled',
    },
    {
        label: '无需处理',
        condition: 'noNeedOp',
        name: 'markNoNeed',
    },
    {
        label: '标记未处理',
        condition: 'unhandledOp',
        name: 'markUnhandled',
    },
]


// 电话需求（AI 电话记录的非预约类客户诉求，每条归属具体门店）
const tablePhoneRequestCol = [
    {
        name: 'id',
        field: 'id',
        label: '需求编号',
        align: 'center',
    },
    {
        name: 'storeName',
        field: 'storeName',
        label: '门店名称',
        align: 'center',
    },
    {
        name: 'phone',
        field: 'phone',
        label: '联系电话',
        align: 'center',
    },
    {
        // 需求类型：AI 自拟的简短分类标签（自由文本，无枚举），直接展示
        name: 'type',
        field: 'type',
        label: '需求类型',
        align: 'center',
    },
    {
        // 长文本：渲染换行、限宽
        name: 'summary',
        field: 'summary',
        label: '简述',
        align: 'center',
        type: ComplexTableColumnTypeEnum.TEXT,
        maxWidth: '20rem',
    },
    {
        name: 'detail',
        field: 'detail',
        label: '详细描述',
        align: 'center',
        type: ComplexTableColumnTypeEnum.TEXT,
        maxWidth: '30rem',
    },
    {
        name: 'handleStatusName',
        field: 'handleStatusName',
        label: '处理状态',
        align: 'center',
        type: ComplexTableColumnTypeEnum.ICON_COLOR,
    },
    {
        // 运营备注：经「编辑备注」操作维护
        name: 'remark',
        field: 'remark',
        label: '备注',
        align: 'center',
        type: ComplexTableColumnTypeEnum.TEXT,
    },
    {
        name: 'createTime',
        field: 'createTime',
        label: '记录时间',
        align: 'center',
    },
    {
        name: 'operation',
        field: 'operation',
        label: '操作',
        align: 'center',
    },
]

export const tablePhoneRequest = {
    tableColumns: tablePhoneRequestCol,
    tableKey: "id",
    selectType: 'none',
    showFullSize: true,
    showTableSetting: true,
}

// 操作与客户反馈一致：编辑备注 + 三态流转
export const tablePhoneRequestOperation = [
    {
        label: '编辑备注',
        condition: 'remarkOp',
        name: 'editRemark',
    },
    {
        label: '标记已处理',
        condition: 'handledOp',
        name: 'markHandled',
    },
    {
        label: '无需处理',
        condition: 'noNeedOp',
        name: 'markNoNeed',
    },
    {
        label: '标记未处理',
        condition: 'unhandledOp',
        name: 'markUnhandled',
    },
]
