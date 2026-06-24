import {createRouter, createWebHistory} from "vue-router";
import {i18n} from '@/i18n/index.js'
import NoAuth from "@/ui/pages/NoAuth.vue";
import NotFound from "@/ui/pages/NotFound.vue";
import NoLogin from "@/ui/pages/NoLogin.vue";
import ZyyMain from "../ui/pages/ZyyMain.vue";
import ZyyLogin from "@/ui/pages/ZyyLogin.vue";
import ZyySubsystem from "@/ui/views/ZyySubsystem.vue";
import ZyyBook from "@/ui/views/book/ZyyBook.vue";
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
                        title: 'Dashboard | 仪表盘'
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
                            meta: {
                                title: 'yl_subsystem_appointment',
                                header: "yl_subsystem_appointment",
                            },
                        },
                        {
                            path: "order",
                            name: "order",
                            component: ZyyOrder,
                            meta: {
                                title: 'yl_subsystem_order',
                                header: "yl_subsystem_order",
                            },
                        },
                        {
                            path: "bill",
                            name: "bill",
                            component: ZyyBill,
                            meta: {
                                title: 'yl_subsystem_bill',
                                header: "yl_subsystem_bill",
                            },
                        },
                        {
                            path: "page",
                            name: "page",
                            component: ZyyPage,
                            meta: {
                                title: 'yl_subsystem_page',
                                header: "yl_subsystem_page",
                            },
                        },
                        {
                            path: "agent",
                            name: "agent",
                            component: ZyyAIAgent,
                            meta: {
                                title: 'yl_subsystem_agent',
                                header: "yl_subsystem_agent",
                            },
                        },
                        {
                            path: "user",
                            name: "user",
                            component: ZyyUser,
                            redirect: {name: 'userUser'},
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
                                        color: 'rgb(var(--full-container-background-color))'
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
                                        color: 'rgb(var(--full-container-background-color))'
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
                                        color: 'rgb(var(--full-container-background-color))'
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
                                        color: 'rgb(var(--full-container-background-color))'
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
                                        color: 'rgb(var(--full-container-background-color))'
                                    },
                                },

                            ]
                        },
                        {
                            path: "staff",
                            name: "staff",
                            component: ZyyStaff,
                            meta: {
                                title: 'yl_subsystem_staff',
                                header: "yl_subsystem_staff",
                            },
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
                title: 'Login | 登录'
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

    // subsystem -> subsystemMain
    'book': 'subsystemMain',
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

router.beforeEach((to, from) => {
    if (to.meta.title) {
        document.title = i18n.global.t(to.meta.title)
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
