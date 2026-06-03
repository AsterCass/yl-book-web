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
        isLogin: false,
        loginToken: "",
        userData: null,
    }),
    actions: {
        updateTheme(code) {
            this.curThemeName = code;
        },
        updateLanguage(code) {
            this.language = code;
        },
        updateToken(token) {
            if (token) {
                this.isLogin = true;
                this.loginToken = token;
            } else {
                this.isLogin = false;
                this.loginToken = "";
                this.userData = null
            }
        },
        updateUserData(data) {
            this.userData = data
        },
    },
});