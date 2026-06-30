import {createRouter, createWebHistory} from "vue-router";
import {i18n} from '@/i18n/index.js'
import {useGlobalStateStore} from "@/utils/global-state.js";
import NoAuth from "@/ui/pages/NoAuth.vue";
import NotFound from "@/ui/pages/NotFound.vue";
import NoLogin from "@/ui/pages/NoLogin.vue";
import ZyyMain from "../ui/pages/ZyyMain.vue";
import ZyyLogin from "@/ui/pages/ZyyLogin.vue";
import ZyySubsystem from "@/ui/views/ZyySubsystem.vue";
import ZyyBook from "@/ui/views/book/ZyyBook.vue";
import ZyyBookBooking from "@/ui/views/book/ZyyBookBooking.vue";
import ZyyBookCalendar from "@/ui/views/book/ZyyBookCalendar.vue";
import ZyyUser from "@/ui/views/user/ZyyUser.vue";
import ZyyStaff from "@/ui/views/staff/ZyyStaff.vue";
import ZyyDashboard from "@/ui/views/ZyyDashboard.vue";
import ZyySubsystemMain from "@/ui/views/ZyySubsystemMain.vue";
import ZyyAIAgent from "@/ui/views/agent/ZyyAIAgent.vue";
import ZyyBill from "@/ui/views/bill/ZyyBill.vue";
import ZyyOrder from "@/ui/views/order/ZyyOrder.vue";
import ZyyPage from "@/ui/views/page/ZyyPage.vue";
import ZyyUserUser from "@/ui/views/user/ZyyUserUser.vue";
import ZyyUserRole from "@/ui/views/user/ZyyUserRole.vue";
import ZyyUserPermission from "@/ui/views/user/ZyyUserPermission.vue";
import ZyyUserStore from "@/ui/views/user/ZyyUserStore.vue";
import ZyyUserTenant from "@/ui/views/user/ZyyUserTenant.vue";
import ZyyStaffStaff from "@/ui/views/staff/ZyyStaffStaff.vue";
import ZyyStaffSkill from "@/ui/views/staff/ZyyStaffSkill.vue";


const router = createRouter({
    // history: createWebHashHistory(process.env.BASE_URL),
    history: createWebHistory(import.meta.env.VITE_BASE_URL),
    routes: [
        {
            path: "/",
            name: "main",
            component: ZyyMain,
            // 正常应该导航到仪表盘，但是这里仪表盘前期没有做的必要
            redirect: {name: 'subsystemMain'},
            children: [
                {
                    path: "dashboard",
                    name: "dashboard",
                    component: ZyyDashboard,
                    meta: {
                        title: 'yl_system_dashboard'
                    },
                },
                {
                    path: "subsystem",
                    name: 'subsystem',
                    component: ZyySubsystem,
                    children: [
                        {
                            path: '',
                            name: 'subsystemRedirect',
                            redirect: {name: 'subsystemMain'}
                        },
                        {
                            path: "main",
                            name: "subsystemMain",
                            component: ZyySubsystemMain,
                            meta: {
                                title: 'yl_subsystem_main',
                                header: "yl_subsystem_main",
                            },
                        },
                        {
                            path: "book",
                            name: "book",
                            component: ZyyBook,
                            redirect: {name: 'bookBooking'},
                            meta: {
                                permission: 'book'
                            },
                            children: [
                                {
                                    path: "booking",
                                    name: "bookBooking",
                                    component: ZyyBookBooking,
                                    meta: {
                                        title: 'yl_subsystem_appointment',
                                        value: "bookBooking",
                                        header: "yl_subsystem_appointment",
                                        label: "yl_subsystem_appointment",
                                        color: 'rgb(var(--full-container-background-color))',
                                        permission: 'book:book'
                                    },
                                },
                                {
                                    path: "calendar",
                                    name: "bookCalendar",
                                    component: ZyyBookCalendar,
                                    meta: {
                                        title: 'yl_subsystem_appointment_calendar',
                                        value: "bookCalendar",
                                        header: "yl_subsystem_appointment_calendar",
                                        label: "yl_subsystem_appointment_calendar",
                                        color: 'rgb(var(--full-container-background-color))',
                                        permission: 'book:calendar'
                                    },
                                },
                            ]
                        },
                        {
                            path: "order",
                            name: "order",
                            component: ZyyOrder,
                            meta: {
                                title: 'yl_subsystem_order',
                                header: "yl_subsystem_order",
                                permission: 'order'
                            },
                        },
                        {
                            path: "bill",
                            name: "bill",
                            component: ZyyBill,
                            meta: {
                                title: 'yl_subsystem_bill',
                                header: "yl_subsystem_bill",
                                permission: 'bill'
                            },
                        },
                        {
                            path: "page",
                            name: "page",
                            component: ZyyPage,
                            meta: {
                                title: 'yl_subsystem_page',
                                header: "yl_subsystem_page",
                                permission: 'page'
                            },
                        },
                        {
                            path: "agent",
                            name: "agent",
                            component: ZyyAIAgent,
                            meta: {
                                title: 'yl_subsystem_agent',
                                header: "yl_subsystem_agent",
                                permission: 'agent'
                            },
                        },
                        {
                            path: "user",
                            name: "user",
                            component: ZyyUser,
                            redirect: {name: 'userUser'},
                            meta: {
                                permission: 'user'
                            },
                            children: [
                                {
                                    path: "user",
                                    name: "userUser",
                                    component: ZyyUserUser,
                                    meta: {
                                        title: 'yl_subsystem_user',
                                        value: "userUser",
                                        header: "yl_subsystem_user",
                                        label: "yl_subsystem_user",
                                        color: 'rgb(var(--full-container-background-color))',
                                        permission: 'user:user'
                                    },
                                },
                                {
                                    path: "role",
                                    name: "userRole",
                                    component: ZyyUserRole,
                                    meta: {
                                        title: 'yl_subsystem_user_role',
                                        value: "userRole",
                                        header: "yl_subsystem_user_role",
                                        label: "yl_subsystem_user_role",
                                        color: 'rgb(var(--full-container-background-color))',
                                        permission: 'user:role'
                                    },
                                },
                                {
                                    path: "permission",
                                    name: "userPermission",
                                    component: ZyyUserPermission,
                                    meta: {
                                        title: 'yl_subsystem_user_tenant',
                                        value: "userPermission",
                                        header: "yl_subsystem_user_permission",
                                        label: "yl_subsystem_user_permission",
                                        color: 'rgb(var(--full-container-background-color))',
                                        permission: 'user:permission'
                                    },
                                },
                                {
                                    path: "store",
                                    name: "userStore",
                                    component: ZyyUserStore,
                                    meta: {
                                        title: 'yl_subsystem_user_store',
                                        value: "userStore",
                                        header: "yl_subsystem_user_store",
                                        label: "yl_subsystem_user_store",
                                        color: 'rgb(var(--full-container-background-color))',
                                        permission: 'user:store'
                                    },
                                },
                                {
                                    path: "tenant",
                                    name: "userTenant",
                                    component: ZyyUserTenant,
                                    meta: {
                                        title: 'yl_subsystem_user_store',
                                        value: "userTenant",
                                        header: "yl_subsystem_user_tenant",
                                        label: "yl_subsystem_user_tenant",
                                        color: 'rgb(var(--full-container-background-color))',
                                        permission: 'user:tenant'
                                    },
                                },

                            ]
                        },
                        {
                            path: "staff",
                            name: "staff",
                            component: ZyyStaff,
                            redirect: {name: 'staffStaff'},
                            meta: {
                                permission: 'staff'
                            },
                            children: [
                                {
                                    path: "staff",
                                    name: "staffStaff",
                                    component: ZyyStaffStaff,
                                    meta: {
                                        title: 'yl_subsystem_staff',
                                        value: "staffStaff",
                                        header: "yl_subsystem_staff",
                                        label: "yl_subsystem_staff",
                                        color: 'rgb(var(--full-container-background-color))',
                                        permission: 'staff:staff'
                                    },
                                },
                                {
                                    path: "Skill",
                                    name: "staffSkill",
                                    component: ZyyStaffSkill,
                                    meta: {
                                        title: 'yl_subsystem_staff_skill',
                                        value: "staffSkill",
                                        header: "yl_subsystem_staff_skill",
                                        label: "yl_subsystem_staff_skill",
                                        color: 'rgb(var(--full-container-background-color))',
                                        permission: 'staff:skill'
                                    },
                                },
                            ]
                        },
                    ]
                },
            ]
        },
        {
            path: "/login",
            name: "login",
            component: ZyyLogin,
            meta: {
                title: 'yl_system_login'
            },
        },
        {
            path: "/404",
            name: '404',
            component: NotFound
        },
        {
            path: "/401",
            name: '401',
            component: NoLogin
        },
        {
            path: "/403",
            name: '403',
            component: NoAuth
        },
        {
            path: "/:catchAll(.*)",
            name: "notFound",
            component: NotFound
        },
    ],
});

const parentRouteMap = {
    // user 子模块 -> subsystemMain
    'userUser': 'subsystemMain',
    'userRole': 'subsystemMain',
    'userPermission': 'subsystemMain',
    'userStore': 'subsystemMain',
    'userTenant': 'subsystemMain',

    'staffStaff': 'subsystemMain',
    'staffSkill': 'subsystemMain',

    'bookBooking': 'subsystemMain',
    'bookCalendar': 'subsystemMain',

    // subsystem -> subsystemMain
    'order': 'subsystemMain',
    'bill': 'subsystemMain',
    'page': 'subsystemMain',
    'agent': 'subsystemMain',
    'staff': 'subsystemMain',
    'user': 'subsystemMain',
}

export function toParentPage(thisRouter) {
    const currentName = thisRouter.currentRoute.value.name
    const parentName = parentRouteMap[currentName]

    if (parentName) {
        thisRouter.push({name: parentName})
    }
}

// 在目标路由的父级下找到第一个有权限访问的兄弟页面（用于默认重定向落到无权页面时兜底）
function findPermittedSibling(to, store) {
    const matched = to.matched
    const parent = matched.length >= 2 ? matched[matched.length - 2] : null
    if (!parent || !parent.children) {
        return null
    }
    for (const child of parent.children) {
        if (!child.name || child.name === to.name) {
            continue
        }
        const childPermission = child.meta ? child.meta.permission : null
        if (store.hasPermission(childPermission)) {
            return child.name
        }
    }
    return null
}

router.beforeEach((to, from) => {
    if (to.meta.title) {
        document.title = i18n.global.t(to.meta.title)
    }

    // 页面级权限校验：仅在已登录（存在用户数据）时拦截，未登录交由请求拦截器/登录流程处理
    const store = useGlobalStateStore()
    const permission = to.meta.permission
    if (permission && store.userData && !store.hasPermission(permission)) {
        const fallback = findPermittedSibling(to, store)
        if (fallback) {
            return {name: fallback}
        }
        return {name: '403'}
    }
})

router.afterEach(() => {
    // make sure scroller site right for header style
    window.scrollTo(0, 0)
})


export function backToHome(thisRouter) {
    thisRouter.push({
        name: "main"
    })
}

export function backToLogin(thisRouter) {
    thisRouter.push({
        name: "login"
    })
}

export function toSpecifyPage(thisRouter, pageName) {
    thisRouter.push({
        name: pageName
    })
}

export function toSpecifyPageWithQuery(thisRouter, pageName, queryMap) {
    thisRouter.push({
        name: pageName,
        query: queryMap,
    })
}

export function toSpecifyPageWithState(thisRouter, pageName, state) {
    thisRouter.push({
        name: pageName,
        state: state,
    })
}

export function toSpecifyPageWithQueryNewTab(thisRouter, pageName, queryMap) {
    const {href} = thisRouter.resolve({name: pageName, query: queryMap});
    const absoluteUrl = `${window.location.origin}${href}`;
    window.open(absoluteUrl, '_blank');
}

export function toReplacePage(thisRouter, queryMap) {
    thisRouter.replace({
        name: thisRouter.name,
        query: queryMap,
    })
}

export function toBack(thisRouter) {
    thisRouter.go(-1)
}

export default router;
