import {defineStore} from 'pinia';

export function createPersistedStatePlugin() {
    return (context) => {
        const {store} = context;

        // 从 Local Storage 加载初始状态
        const savedState = localStorage.getItem(store.$id);
        if (savedState) {
            store.$patch(JSON.parse(savedState));
        }

        // 监听 store 变化并保存到 Local Storage
        store.$subscribe((mutation, state) => {
            localStorage.setItem(store.$id, JSON.stringify(state));
        });
    };
}

export const useGlobalStateStore = defineStore('globalState', {
    state: () => ({
        curThemeName: 'light',
        language: '',
        userData: null,
        loginInfo: null,
    }),
    getters: {
        // 当前用户拥有的权限码集合（兼容 userData 直接为用户对象或包一层 userData 两种结构）
        permissionCodeSet(state) {
            const ud = state.userData
            const list = (ud && (ud.permissionDtoList
                || (ud.userData && ud.userData.permissionDtoList))) || []
            const set = new Set()
            for (const per of list) {
                if (per && per.code) {
                    set.add(per.code)
                }
            }
            return set
        },
        // 判断是否拥有某个权限码（页面级）；未传 code 视为不限制
        hasPermission() {
            return (code) => {
                if (!code) {
                    return true
                }
                return this.permissionCodeSet.has(code)
            }
        },
    },
    actions: {
        updateTheme(code) {
            this.curThemeName = code;
        },
        updateLanguage(code) {
            this.language = code;
        },
        updateUserData(data) {
            this.userData = data
        },
        updateLoginInfo(data) {
            this.loginInfo = data
        }
    },
});