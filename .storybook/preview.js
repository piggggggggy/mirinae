import "@/styles/style.pcss";

import { withDesign } from 'storybook-addon-designs';

import Notifications from '@kyvg/vue3-notification'

import { createRouter } from 'vue-router';
import velocity from 'velocity-animate';
import { VueSvgIconPlugin, setOptions } from '@yzfe/vue3-svgicon'

import webFontLoader from 'webfontloader';
import { fontUrls, webFonts } from '@/styles/web-fonts.cjs';

import { app } from '@storybook/vue3';
import SpaceOneTheme from './CloudforetTheme';
import { i18n, I18nConnector } from '@/translations'
import { applyAmchartsGlobalSettings } from '@/plugins/amcharts';
import screens from '@/styles/screens.cjs';
import FloatingVue from 'floating-vue';



// app.use(VueRouter)
app.use(i18n);
app.use(Notifications, { velocity });
app.use(VueSvgIconPlugin, {
    tagName: 'svgicon',
});
setOptions({
    classPrefix: 'p-i',
});
app.use(FloatingVue, { boundary: document.body });


applyAmchartsGlobalSettings()

app.config.globalProperties.toJSON = function () {
    return this;
};

I18nConnector.i18n = i18n;

webFontLoader.load({
    google: {
        families: webFonts,
        urls: fontUrls,
    },
});


const viewports = {}
Object.keys(screens).forEach(k => {
    const v = screens[k];
    viewports[k] = {
        name: k,
        styles: {
            width: v.min || v.max,
            height: '100%',
        }
    }
})



export const decorators = [
    withDesign,
    (story, { globals: { locale } }) => {
        i18n.locale = locale;
        return {
            i18n,
            router: new VueRouter(),
            template: '<story/>',
        }
    }
]

export const parameters = {
    controls: { expanded: true },
    layout: 'centered',
    docs: {
        extractComponentDescription: (component, { notes }) => {
            if (notes) {
                return typeof notes === 'string' ? notes : notes.markdown || notes.text;
            }
            return null;
        },
        theme: SpaceOneTheme,
    },
    viewport: {
        viewports,
    },
    options: {
        storySort: (a, b) =>
            a[1].kind === b[1].kind ? 0 : a[1].id.localeCompare(b[1].id, undefined, { numeric: true }),
    },
    actions: { argTypesRegex:  '^on.*' },
}

export const globalTypes = {
    locale: {
        name: 'locale',
        description: 'Internationalization locale',
        defaultValue: 'en',
        toolbar: {
            icon: 'globe',
            items: [
                { value: 'en', right: '🇺🇸', title: 'English' },
                { value: 'ko', right: '🇰🇷', title: '한국어' },
                { value: 'jp', right: '🇯🇵', title: '日本語' },
            ],
        },
    },
};
