import { reactive, toRefs } from '@vue/composition-api';
import { boolean } from '@storybook/addon-knobs/vue';
import PLazyImg from '@/components/organisms/lazy-img/PLazyImg.vue';

export default {
    title: 'FeedBacks/Loading',
    component: PLazyImg,
};

export const lazyImg = () => ({
    components: { PLazyImg },
    template: `        
<div>
    <p-lazy-img :src="iconUrl"
                :loading="loading"
                width="2rem" height="2rem"
    />
</div>`,
    props: {
        loading: {
            default: boolean('loading', false),
        },
    },
    setup() {
        const state = reactive({
            iconUrl: '',
        });

        return {
            ...toRefs(state),
        };
    },
});