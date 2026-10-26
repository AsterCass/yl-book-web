/*
* [官方]
* name：当前列code，唯一id同表不重复。用于指定表的主键id、指定自定义槽等功能
* required（可选）：使用visible-columns属性后，该列仍然显示
* label：实际显示在设备界面该行的文字
* align（可选，默认 'right' ）：当前列框中数据的校准位置
* field：绑定数据字段，一般和name相同
*
* [自定义]
* labelKey（可选）：i18n 键，有就按当前语言显示（切换语言即时生效），label 只作兜底
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
        labelKey: 'staff_device.table.col.name',
        align: 'center',
    },
    {
        name: 'storeName',
        field: 'storeName',
        label: '门店',
        labelKey: 'staff_device.table.col.store',
        align: 'center',
    },
    {
        // 设备密钥明文（管理员可见）：POINT 列显示为可点击文字，点击即复制（ZyyStaffDevice 监听 columnClick）
        name: 'deviceKey',
        field: 'deviceKey',
        label: '密钥（点击复制）',
        labelKey: 'staff_device.table.col.device_key',
        align: 'center',
        type: ComplexTableColumnTypeEnum.POINT,
    },
    {
        // 启用 / 停用，文案与颜色由 ZyyStaffDevice 写入 statusName / statusNameWebColorName
        name: 'statusName',
        field: 'statusName',
        label: '状态',
        labelKey: 'staff_device.table.col.status',
        align: 'center',
        type: ComplexTableColumnTypeEnum.ICON_COLOR,
    },
    {
        // 在线（绿）/ 离线（灰）：后端按最近一次心跳是否在 3 分钟内算出
        name: 'onlineName',
        field: 'onlineName',
        label: '在线',
        labelKey: 'staff_device.table.col.online',
        align: 'center',
        type: ComplexTableColumnTypeEnum.ICON_COLOR,
    },
    {
        // 门店本地时间；从未上报过心跳时显示「从未上线」
        name: 'lastHeartbeatTime',
        field: 'lastHeartbeatTime',
        label: '最近心跳',
        labelKey: 'staff_device.table.col.last_heartbeat',
        align: 'center',
    },
    {
        name: 'lastHeartbeatIp',
        field: 'lastHeartbeatIp',
        label: '心跳 IP',
        labelKey: 'staff_device.table.col.heartbeat_ip',
        align: 'center',
    },
    {
        // 心跳 IP 当前是否因密钥错太多被锁（锁着时一体机收到 706）、累计错了几次；文案与颜色由 ZyyStaffDevice 写入
        name: 'ipLockName',
        field: 'ipLockName',
        label: 'IP 锁定',
        labelKey: 'staff_device.table.col.ip_lock',
        align: 'center',
        type: ComplexTableColumnTypeEnum.ICON_COLOR,
    },
    {
        // 取自心跳 JSON 的 version 字段
        name: 'version',
        field: 'version',
        label: '版本',
        labelKey: 'staff_device.table.col.version',
        align: 'center',
    },
    {
        // 已同步（绿）：心跳里上报的已应用配置版本 = 当前生效版本；否则待拉取（橙），一体机下一次心跳后自己拉
        name: 'configSyncName',
        field: 'configSyncName',
        label: '配置同步',
        labelKey: 'staff_device.table.col.config_sync',
        align: 'center',
        type: ComplexTableColumnTypeEnum.ICON_COLOR,
    },
    {
        // 一体机上报的心跳原文（ZyyStaffDevice 按 JSON 缩进排版）：内容较长，默认隐藏，排查问题时在列设置里勾选
        name: 'heartbeatInfo',
        field: 'heartbeatInfo',
        label: '心跳详情',
        labelKey: 'staff_device.table.col.heartbeat_info',
        align: 'center',
        type: ComplexTableColumnTypeEnum.TEXT,
        maxWidth: '24rem',
        defaultVisible: false,
    },
    {
        name: 'remark',
        field: 'remark',
        label: '备注',
        labelKey: 'staff_device.table.col.remark',
        align: 'center',
        type: ComplexTableColumnTypeEnum.TEXT,
    },
    {
        name: 'operation',
        field: 'operation',
        label: '操作',
        labelKey: 'staff_device.table.col.operation',
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
 * label：展示在操作列的操作文字内容（有 labelKey 时按 i18n 显示，label 只作兜底）
 * condition：出现条件，比如出现条件为 'cod', 那么只有在该行数据 thisData.cod 判断为 true 的时候才会显示
 * name：在设备点击时候，会将该字段值传回，用于确定哪个label被点击
 * color: 按钮颜色
 */
export const tableStaffDeviceOperation = [
    {
        label: '编辑',
        labelKey: 'staff_device.table.op.update',
        condition: 'updateOp',
        name: 'update',
    },
    {
        // 这台设备的下发配置（大模型 / 语音合成 / 调试口令），新建时为空
        label: '配置',
        labelKey: 'staff_device.table.op.config',
        condition: 'configOp',
        name: 'config',
    },
    {
        // 旧密钥立即失效，一体机需重新配置新密钥（确认弹窗里有提示）
        label: '重置密钥',
        labelKey: 'staff_device.table.op.reset_key',
        condition: 'resetKeyOp',
        name: 'resetKey',
    },
    {
        // 只在心跳 IP 正被锁着时出现
        label: '解锁 IP',
        labelKey: 'staff_device.table.op.unlock_ip',
        condition: 'unlockIpOp',
        name: 'unlockIp',
    },
    {
        label: '删除',
        labelKey: 'staff_device.table.op.delete',
        condition: 'deleteOp',
        name: 'delete',
        color: 'rgb(var(--negative))',
    },
]
