import i18n from '@/i18n';
import {Quasar} from 'quasar'
import zh from 'quasar/lang/zh-CN'
import en from 'quasar/lang/en-US'
import {useGlobalStateStore} from '@/utils/global-state';
import {isMiniScreenMethod} from "@/utils/base-tools";

export function initGlobalState() {
    const globalState = useGlobalStateStore();
    //theme
    document.documentElement.setAttribute('data-theme', globalState.curThemeName);
    //show scroller bar
    document.documentElement.setAttribute('hide-scrollbar', String(globalState.hideScroller));
    //language
    const lang = globalState.language ? globalState.language : navigator.language.slice(0, 2);
    i18n.global.locale = lang
    if (lang === 'zh') {
        Quasar.lang.set(zh)
        globalState.updateLanguage('zh');
    } else {
        Quasar.lang.set(en)
        globalState.updateLanguage('en');
    }
    //screen size
    globalState.updateScreenMini(isMiniScreenMethod());
    //login data check token expire
    if (globalState.isLogin) {
        // todo  check login
    }
    //more
}


export function updateTheme(code) {
    if (code === 'dark' || code === 'light' || code === 'green') {
        const globalState = useGlobalStateStore();
        document.documentElement.setAttribute('data-theme', code);
        globalState.updateTheme(code);
    }
}

export function switchTheme() {
    const globalState = useGlobalStateStore();

    let curThemeName = document.documentElement.getAttribute("data-theme")
    let themeName = 'dark'
    if (curThemeName === 'dark') {
        themeName = 'green'
    } else if (curThemeName === 'green') {
        themeName = 'light'
    }
    document.documentElement.setAttribute('data-theme', themeName);
    globalState.updateTheme(themeName);
}

export function updateLanguage(code) {
    const globalState = useGlobalStateStore();
    if (code === 'en') {
        i18n.global.locale = 'en'
        Quasar.lang.set(en)
        globalState.updateLanguage(code);
    } else if (code === 'zh') {
        i18n.global.locale = 'zh'
        Quasar.lang.set(zh)
        globalState.updateLanguage(code);
    }
}

export function switchLanguage() {
    const globalState = useGlobalStateStore();
    if (i18n.global.locale === 'en') {
        i18n.global.locale = 'zh'
        Quasar.lang.set(zh)
        globalState.updateLanguage('zh');
    } else {
        i18n.global.locale = 'en'
        Quasar.lang.set(en)
        globalState.updateLanguage('en');
    }
}

