<script lang="ts">
import PBadge from '@/data-display/badges/PBadge.vue';
import type { Badge } from '@/data-display/badges/type';
import { BADGE_SHAPE } from '@/data-display/badges/type';
import type { BadgeDynamicFieldProps } from '@/data-display/dynamic/dynamic-field/templates/badge/type';
import type { BadgeOptions } from '@/data-display/dynamic/dynamic-field/type/field-schema';
import PAnchor from '@/inputs/anchors/PAnchor.vue';
import { commaFormatter, getColor } from '@/util/helpers';

export default {
    name: 'PDynamicFieldBadge',
    functional: true,
    components: { PBadge },
    props: {
        options: {
            type: Object,
            default: () => ({}),
        },
        data: {
            type: [String, Object, Array, Boolean, Number],
            default: undefined,
        },
        typeOptions: {
            type: Object,
            default: () => ({}),
        },
        extraData: {
            type: Object,
            default: () => ({}),
        },
        handler: {
            type: Function,
            default: undefined,
        },
    },
    render(h, { props }: {props: BadgeDynamicFieldProps}) {
        const options: BadgeOptions = props.options;
        const badgeProps = {} as Badge;

        if (options.shape) {
            badgeProps.shape = BADGE_SHAPE[options.shape];
        }

        if (options.outline_color) {
            badgeProps.outline = true;
            badgeProps.backgroundColor = getColor(options.outline_color);
        } else {
            badgeProps.backgroundColor = getColor(options.background_color);
            badgeProps.textColor = getColor(options.text_color);
        }

        let badgeEl = props.data ?? props.options.default;
        if (badgeEl === undefined || badgeEl === null) return undefined;
        if (typeof badgeEl === 'number') badgeEl = commaFormatter(badgeEl);

        if (options.link) {
            badgeEl = [h(PAnchor, {
                attrs: { href: options.link, target: '_blank' },
            }, badgeEl)];
        }

        return h(PBadge, { props: badgeProps, class: { 'p-dynamic-field-badge': true } }, badgeEl);
    },
};
</script>

<style lang="postcss">
.p-dynamic-field-badge {
    .p-anchor {
        font-size: inherit;
    }
}
</style>
