import type { App } from 'vue';


import Notifications from '@kyvg/vue3-notification';
import type { NotificationsOptions } from '@kyvg/vue3-notification';
// import VTooltip from 'v-tooltip';
import FloatingVue, { VTooltip } from 'floating-vue';
import { setOptions, VueSvgIconPlugin } from '@yzfe/vue3-svgicon';
import velocity from 'velocity-animate';
import type { I18n } from 'vue-i18n';
import type { Router } from 'vue-router';
import 'floating-vue/dist/style.css';

import { i18n, I18nConnector } from '@/translations';

import { applyAmchartsGlobalSettings } from './plugins/amcharts';

export interface MirinaeOptions {
    // installVueRouter?: boolean;
    installVueI18n?: boolean;
    installFragment?: boolean;
    amchartsLicenses?: string[];
    vueI18n?: I18n;
    vueRouter?: Router;
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
declare module 'vue' {

    interface Vue {
        $notify: (options: NotificationsOptions | string) => void;
    }
	// eslint-disable-next-line @typescript-eslint/no-shadow
    interface VueConstructor {
        notify: (options: NotificationsOptions | string) => void;
    }

}

// const router = createRouter({});


export class MirinaeInstaller {
    private static _options: MirinaeOptions;

    static get options() {
        return MirinaeInstaller._options;
    }

    private static _install(vueInstance: App) {
        const options = MirinaeInstaller._options;
        // if (options?.installVueRouter) vueInstance.use(router);
        vueInstance.use(Notifications, { velocity });
        vueInstance.use(VueSvgIconPlugin, {
            tagName: 'svgicon',
        })
        setOptions({
            classPrefix: 'p-i',
        })
        // TODO: VTooltip refactoring
        // vueInstance.use(VTooltip, { defaultClass: 'p-tooltip', defaultBoundariesElement: document.body });
        vueInstance.use(FloatingVue, { boundary: document.body });
        vueInstance.directive('tooltip', VTooltip);
        // TODO: Create VueRouter Connector and link? or deprecated?
        vueInstance.use(options?.installVueI18n ? i18n : options.vueI18n);
        I18nConnector.i18n = options.vueI18n ?? i18n;
        applyAmchartsGlobalSettings(options?.amchartsLicenses);
    }

    static install = (vueInstance: App, options: MirinaeOptions = {}) => {
        MirinaeInstaller._options = options;
        MirinaeInstaller._install(vueInstance);
    };
}
