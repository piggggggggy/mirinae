<template>
    <component :is="isAnchor ? 'router-link' : 'span'"
               class="p-context-menu-item"
               :class="{selected, disabled, 'is-anchor': isAnchor}"
               v-bind="{...routerLinkProps, ...$attrs}"
               v-on="$listeners"
    >
        <p-i v-if="selectIcon"
             class="select-marker"
             :name="selectIcon"
             width="1em" height="1em"
        />
        <span class="label-wrapper" :class="{ellipsis}">
            <p-text-highlighting v-if="highlightTerm && !$slots.default"
                                 :text="label" :term="highlightTerm"
                                 class="text"
                                 style-type="secondary"
            >
                <template #default="textHighlightingSlotProps">
                    <slot name="text-list" v-bind="{...textHighlightingSlotProps, ...$props}" />
                </template>
            </p-text-highlighting>
            <span v-else class="text">
                <slot name="default" v-bind="$props">
                    {{ label }}
                </slot>
            </span>
            <p-i v-if="link" name="ic_external-link"
                 class="external-link-icon"
                 width="0.875rem" height="0.875rem"
            />
        </span>
    </component>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import {
    computed,
    defineComponent, reactive, toRefs,
} from 'vue';

import type { TranslateResult } from 'vue-i18n';
import type { Location } from 'vue-router';

import PTextHighlighting from '@/data-display/text-highlighting/PTextHighlighting.vue';
import PI from '@/foundation/icons/PI.vue';
import { SELECT_MARKERS } from '@/inputs/context-menu/context-menu-item/config';


export type SelectMarker = typeof SELECT_MARKERS[number];
export interface ContextMenuItemProps {
    name?: string | number;
    label?: number | TranslateResult;
    link?: string;
    to?: Location;
    disabled?: boolean;
    selected?: boolean;
    selectMarker?: SelectMarker;
    ellipsis?: boolean;
    highlightTerm?: string;
}

export default defineComponent<ContextMenuItemProps>({
    name: 'PContextMenuItem',
    components: {
        PTextHighlighting,
        PI,
    },
    props: {
        name: {
            type: [String, Number],
            default: '',
        },
        label: {
            type: [String, Number],
            default: '',
        },
        link: {
            type: String,
            default: '',
        },
        to: {
            type: Object as PropType<Location>,
            default: undefined,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        selected: {
            type: Boolean,
            default: false,
        },
        selectMarker: {
            type: String as PropType<SelectMarker|undefined>,
            default: undefined,
            validator(marker?: SelectMarker) {
                return marker === undefined || SELECT_MARKERS.includes(marker);
            },
        },
        ellipsis: {
            type: Boolean,
            default: false,
        },
        highlightTerm: {
            type: String,
            default: '',
        },
    },
    setup(props) {
        const state = reactive({
            selectIcon: computed<string|undefined>(() => {
                if (props.selectMarker === 'checkbox') {
                    if (props.selected) {
                        return props.disabled ? 'ic_checkbox-disabled-check' : 'ic_checkbox--checked';
                    }
                    return props.disabled ? 'ic_checkbox--disabled' : 'ic_checkbox';
                }
                if (props.selectMarker === 'radio') {
                    if (props.disabled) return 'ic_radio--disabled';
                    return props.selected ? 'ic_radio--checked' : 'ic_radio';
                }
                return undefined;
            }),
            isAnchor: computed(() => !props.disabled && (props.link || props.to)),
            routerLinkProps: computed(() => {
                if (state.isAnchor) {
                    return {
                        to: props.to && !props.disabled ? props.to : {},
                        href: props.link,
                        target: props.link ? '_blank' : undefined,
                    };
                }
                return {};
            }),
        });
        return {
            ...toRefs(state),
        };
    },
});

</script>

<style lang="postcss">
.p-context-menu-item {
    @apply text-gray-900;
    display: flex;
    padding: 0.5rem;
    line-height: 1.25;
    font-size: 0.875rem;
    cursor: pointer;
    &:not(.disabled) {
        &:hover, &:focus {
            @apply bg-blue-100;
            &.is-anchor {
                > .label-wrapper .text {
                    text-decoration: underline;
                }
            }
        }
    }
    &.disabled {
        @apply text-gray-300;
        cursor: not-allowed;
    }
    &.selected:not(.disabled) {
        @apply bg-blue-200;
    }
    > .select-marker {
        flex-shrink: 0;
        margin-right: 0.25rem;
        font-size: 1.25rem;
    }
    > .label-wrapper {
        flex-grow: 1;
        overflow: hidden;
        line-height: inherit;
        vertical-align: middle;
        &.ellipsis {
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        > .external-link-icon {
            margin-left: 0.25rem;
            line-height: inherit;
        }
    }
}
</style>
