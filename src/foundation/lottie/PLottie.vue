<template>
    <div class="p-lottie">
        <div ref="lottieRef" :style="{
            height: height || `${size}rem`,
            width: width || `${size}rem`,
        }"
        />
    </div>
</template>
<script lang="ts">
import {
    defineComponent, onMounted, onUnmounted, reactive, toRefs, watch,
} from 'vue';

import lottie from 'lottie-web';

import type { LottieProps } from '@/foundation/lottie/type';

/** <Default rendererSettings>
 *
     preserveAspectRatio: (config && config.preserveAspectRatio) || 'xMidYMid meet',
     imagePreserveAspectRatio: (config && config.imagePreserveAspectRatio) || 'xMidYMid slice',
     progressiveLoad: (config && config.progressiveLoad) || false,
     hideOnTransparent: (config && config.hideOnTransparent === false) ? false : true,
     viewBoxOnly: (config && config.viewBoxOnly) || false,
     viewBoxSize: (config && config.viewBoxSize) || false,
     className: (config && config.className) || '',
     id: (config && config.id) || '',
     focusable: config && config.focusable,
     filterSize: {
        width: config && config.filterSize && config.filterSize.width || '100%',
        height: config && config.filterSize && config.filterSize.height || '100%',
        x: config && config.filterSize && config.filterSize.x || '0%',
        y: config && config.filterSize && config.filterSize.y || '0%',
    }
 */

export default defineComponent<LottieProps>({
    name: 'PLottie',
    props: {
        name: {
            type: String,
            required: true,
            default: 'cloudone_loading',
        },
        size: {
            type: Number,
            default: 1,
        },
        height: {
            type: String,
            default: undefined,
        },
        width: {
            type: String,
            default: undefined,
        },
    },
    setup(props: LottieProps) {
        const state = reactive({
            animation: null as any,
            lottieRef: null as any,
            uuid: Math.floor(Math.random() * Date.now()).toString(),
        });

        let stopWatch: any;

        const loadLottie = async () => {
            if (!state.lottieRef) return;

            // noinspection TypeScriptCheckImport
            const lottieFile = await import(/* webpackMode: "eager" */ `./p-lotties/${props.name}.json`);
            if (lottieFile) {
                state.animation = await lottie.loadAnimation({
                    name: state.uuid,
                    container: state.lottieRef,
                    renderer: 'svg',
                    loop: true,
                    autoplay: true,
                    animationData: lottieFile,
                });
            }
        };

        onMounted(async () => {
            stopWatch = watch(() => props.name, async (after) => {
                if (after) await loadLottie();
            }, { immediate: true });
        });

        onUnmounted(() => {
            lottie.destroy(state.uuid);
            stopWatch();
        });


        return {
            ...toRefs(state),
        };
    },
});
</script>
