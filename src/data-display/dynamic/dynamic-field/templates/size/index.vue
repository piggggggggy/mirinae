<script lang="ts">
import type { RenderContext } from 'vue/types/options';
import type { VNode } from 'vue/types/vnode';

import bytes from 'bytes';

import type { SizeDynamicFieldProps } from '@/data-display/dynamic/dynamic-field/templates/size/type';
import type { SizeOptions } from '@/data-display/dynamic/dynamic-field/type/field-schema';
import PAnchor from '@/inputs/anchors/PAnchor.vue';

const unitMap: Record<string, bytes.Unit> = {
    BYTES: 'B',
    KB: 'KB',
    MB: 'MB',
    GB: 'GB',
    PB: 'PB',
    TB: 'TB',
};
const UNIT_SEPARATOR = ' ';

export default {
    name: 'PDynamicFieldSize',
    functional: true,
    components: { PAnchor },
    props: {
        options: {
            type: Object,
            default: () => ({}),
        },
        data: {
            type: [String, Object, Array, Boolean, Number],
            default: null,
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
    render(h, { props, data }: RenderContext<SizeDynamicFieldProps>): VNode {
        let value: number|null;

        if (typeof props.data === 'number') value = props.data;
        else if (typeof props.data === 'string') value = Number(props.data);
        else if (props.options.default !== undefined) value = props.options.default ?? 0;
        else value = null;

        let formattedValue: string;
        if (value === null) formattedValue = '-';
        else {
            const displayUnit: bytes.Unit|undefined = unitMap[props.options.display_unit as string] || undefined;
            const sourceUnit: bytes.Unit|undefined = unitMap[props.options.source_unit as string] || undefined;
            const bytesOptions: bytes.BytesOptions = { unit: displayUnit, unitSeparator: UNIT_SEPARATOR };

            if (sourceUnit) {
                value = bytes.parse(`${props.data}${sourceUnit}`);
            }

            const res = bytes(value, bytesOptions);
            if (!res) formattedValue = '-';
            else if (res.split(UNIT_SEPARATOR)[1] === 'B') {
                formattedValue = `${value} bytes`;
            } else {
                formattedValue = res;
            }
        }

        let sizeEl = h('span', data, formattedValue);

        if (props.options.link) {
            sizeEl = h(PAnchor, {
                attrs: { href: (props.options as SizeOptions).link, target: '_blank' },
                props: { value, showIcon: !!formattedValue },
            }, [sizeEl]);
        }

        return sizeEl;
    },
};
</script>
