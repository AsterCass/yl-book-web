import {createRouter, createWebHistory} from "vue-router";
import NoAuth from "@/ui/pages/NoAuth.vue";
import NotFound from "@/ui/pages/NotFound.vue";
import NoLogin from "@/ui/pages/NoLogin.vue";
import ZyyMain from "../ui/pages/ZyyMain.vue";
import ZyyLogin from "@/ui/pages/ZyyLogin.vue";
import ZyySubsystem from "@/ui/views/ZyySubsystem.vue";
import ZyyBook from "@/ui/views/ZyyBook.vue";
import ZyyUser from "@/ui/views/ZyyUser.vue";
import ZyyStaff from "@/ui/views/ZyyStaff.vue";
import ZyyDashboard from "@/ui/views/ZyyDashboard.vue";
import ZyySubsystemMain from "@/ui/views/ZyySubsystemMain.vue";


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
                                title: 'Subsystem | 子系统选择'
                            },
                        },
                        {
                            path: "book",
                            name: "book",
                            component: ZyyBook,
                            meta: {
                                title: 'Appointment | 预约管理'
                            },
                        },
                        {
                            path: "user",
                            name: "user",
                            component: ZyyUser,
                            meta: {
                                title: 'User | 用户管理'
                            },
                        },
                        {
                            path: "staff",
                            name: "staff",
                            component: ZyyStaff,
                            meta: {
                                title: 'Staff | 雇员管理'
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


router.beforeEach((to, from, next) => {
    if (to.meta.title) {
        document.title = to.meta.title
    }
    next()
})

router.afterEach(() => {
    //make sure scroller site right for header style
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
