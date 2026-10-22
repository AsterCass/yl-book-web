/*
* [官方]
* name：当前列code，唯一id同表不重复。用于指定表的主键id、指定自定义槽等功能
* required（可选）：使用visible-columns属性后，该列仍然显示
* label：实际显示在设备界面该行的文字
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

const tableStaffDeviceCol = [
    {
        name: 'name',
        field: 'name',
        label: '名称',
        align: 'center',
    },
    {
        name: 'storeName',
        field: 'storeName',
        label: '门店',
        align: 'center',
    },
    {
        // 设备密钥明文（管理员可见）：POINT 列显示为可点击文字，点击即复制（ZyyStaffDevice 监听 columnClick）
        name: 'deviceKey',
        field: 'deviceKey',
        label: '密钥（点击复制）',
        align: 'center',
        type: ComplexTableColumnTypeEnum.POINT,
    },
    {
        // 启用 / 停用，文案与颜色由 ZyyStaffDevice 写入 statusName / statusNameWebColorName
        name: 'statusName',
        field: 'statusName',
        label: '状态',
        align: 'center',
        type: ComplexTableColumnTypeEnum.ICON_COLOR,
    },
    {
        // 在线（绿）/ 离线（灰）：后端按最近一次心跳是否在 3 分钟内算出
        name: 'onlineName',
        field: 'onlineName',
        label: '在线',
        align: 'center',
        type: ComplexTableColumnTypeEnum.ICON_COLOR,
    },
    {
        // 门店本地时间；从未上报过心跳时显示「从未上线」
        name: 'lastHeartbeatTime',
        field: 'lastHeartbeatTime',
        label: '最近心跳',
        align: 'center',
    },
    {
        name: 'lastHeartbeatIp',
        field: 'lastHeartbeatIp',
        label: '心跳 IP',
        align: 'center',
    },
    {
        // 取自心跳 JSON 的 version 字段
        name: 'version',
        field: 'version',
        label: '版本',
        align: 'center',
    },
    {
        // 一体机上报的心跳原文（ZyyStaffDevice 按 JSON 缩进排版）：内容较长，默认隐藏，排查问题时在列设置里勾选
        name: 'heartbeatInfo',
        field: 'heartbeatInfo',
        label: '心跳详情',
        align: 'center',
        type: ComplexTableColumnTypeEnum.TEXT,
        maxWidth: '24rem',
        defaultVisible: false,
    },
    {
        name: 'remark',
        field: 'remark',
        label: '备注',
        align: 'center',
        type: ComplexTableColumnTypeEnum.TEXT,
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
export const tableStaffDevice = {
    tableColumns: tableStaffDeviceCol,
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
 * name：在设备点击时候，会将该字段值传回，用于确定哪个label被点击
 * color: 按钮颜色
 */
export const tableStaffDeviceOperation = [
    {
        label: '编辑',
        condition: 'updateOp',
        name: 'update',
    },
    {
        // 旧密钥立即失效，一体机需重新配置新密钥（确认弹窗里有提示）
        label: '重置密钥',
        condition: 'resetKeyOp',
        name: 'resetKey',
    },
    {
        label: '删除',
        condition: 'deleteOp',
        name: 'delete',
        color: 'rgb(var(--negative))',
    },
]
