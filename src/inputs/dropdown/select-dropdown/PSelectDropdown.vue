<template>
    <div v-click-outside="handleClickOutside" class="p-select-dropdown"
         :class="{
             [styleType] : true,
             invalid,
             disabled,
             'read-only': readOnly,
             active: proxyVisibleMenu && !readOnly,
         }"
    >
        <p-icon-button v-if="styleType === SELECT_DROPDOWN_STYLE_TYPE.ICON_BUTTON"
                       ref="targetRef"
                       :name="buttonIcon || (proxyVisibleMenu ? 'ic_arrow_top' : 'ic_arrow_bottom')"
                       :activated="proxyVisibleMenu"
                       :disabled="disabled"
                       color="inherit"
                       class="icon-button"
                       @click="handleClick"
                       @keydown.down="handlePressDownKey"
        />
        <button v-else
                ref="targetRef"
                class="dropdown-button"
                @click="handleClick"
                @keydown.down="handlePressDownKey"
        >
            <span class="text" :class="{placeholder: !$scopedSlots.default && !selectedItem}">
                <slot name="default">
                    {{
                        selectedItem ?
                            (selectedItem.label || selectedItem.name || '') :
                            (placeholder || $t('COMPONENT.SELECT_DROPDOWN.SELECT'))
                    }}
                </slot>
            </span>
            <p-i v-if="!(styleType === SELECT_DROPDOWN_STYLE_TYPE.TRANSPARENT && readOnly)"
                 :name="proxyVisibleMenu ? 'ic_arrow_top' : 'ic_arrow_bottom'"
                 :activated="proxyVisibleMenu"
                 :disabled="disabled"
                 color="inherit"
                 class="dropdown-icon"
            />
        </button>
        <p-context-menu v-show="proxyVisibleMenu"
                        ref="contextMenuRef"
                        :class="{ [menuPosition]: !useFixedMenuStyle }"
                        :menu="items"
                        :loading="loading"
                        :invalid="invalid"
                        :style="{
                            ...contextMenuStyle,
                            ...(styleType === SELECT_DROPDOWN_STYLE_TYPE.ICON_BUTTON && {width: 'auto'}),
                        }"
                        item-height-fixed
                        no-select-indication
                        @select="onSelectMenu"
        >
            <template v-for="(_, slot) of menuSlots" #[slot]="scope">
                <slot :name="`menu-${slot}`" v-bind="scope" />
            </template>
        </p-context-menu>
    </div>
</template>

<script lang="ts">
import {
    computed,
    defineComponent,
    getCurrentInstance,
    reactive,
    toRefs,
} from 'vue';
import type { Vue } from 'vue/types/vue';

import { groupBy, reduce } from 'lodash';
import vClickOutside from 'v-click-outside';


import PI from '@/foundation/icons/PI.vue';
import { useContextMenuFixedStyle } from '@/hooks/context-menu-fixed-style';
import PIconButton from '@/inputs/buttons/icon-button/PIconButton.vue';
import PContextMenu from '@/inputs/context-menu/PContextMenu.vue';
import type { MenuItem } from '@/inputs/context-menu/type';
import type { SelectDropdownProps } from '@/inputs/dropdown/select-dropdown/type';
import {
    SELECT_DROPDOWN_STYLE_TYPE,
    CONTEXT_MENU_POSITION,
} from '@/inputs/dropdown/select-dropdown/type';
import { makeOptionalProxy } from '@/util/composition-helpers';


export default defineComponent<SelectDropdownProps>({
    name: 'PSelectDropdown',
    directives: {
        clickOutside: vClickOutside.directive,
    },
    components: {
        PI,
        PIconButton,
        PContextMenu,
    },
    model: {
        prop: 'selected',
        event: 'update:selected',
    },
    props: {
        /* context menu fixed style props */
        useFixedMenuStyle: {
            type: Boolean,
            default: false,
        },
        visibleMenu: {
            type: Boolean,
            default: undefined,
        },
        /* context menu props */
        invalid: {
            type: Boolean,
            default: false,
        },
        loading: {
            type: Boolean,
            default: false,
        },
        /* select dropdown props */
        items: {
            type: Array,
            default: () => [],
        },
        selected: {
            type: [String, Number],
            default: undefined,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        indexMode: {
            type: Boolean,
            default: false,
        },
        placeholder: {
            type: String,
            default: '',
        },
        styleType: {
            type: String,
            default: SELECT_DROPDOWN_STYLE_TYPE.DEFAULT,
            validator: (value: SELECT_DROPDOWN_STYLE_TYPE) => Object.values(SELECT_DROPDOWN_STYLE_TYPE).includes(value),
        },
        buttonIcon: {
            type: String,
            default: undefined,
        },
        menuPosition: {
            type: String,
            default: CONTEXT_MENU_POSITION.LEFT,
            validator: (value: CONTEXT_MENU_POSITION) => Object.values(CONTEXT_MENU_POSITION).includes(value),
        },
        readOnly: {
            type: Boolean,
            default: false,
        },
    },
    setup(props: SelectDropdownProps, { emit, slots }) {
        const vm = getCurrentInstance()?.proxy as Vue;

        const {
            proxyVisibleMenu, targetRef, targetElement, contextMenuStyle,
        } = useContextMenuFixedStyle({
            useFixedMenuStyle: computed(() => props.useFixedMenuStyle),
            visibleMenu: computed(() => props.visibleMenu),
        });
        const contextMenuFixedStyleState = reactive({
            proxyVisibleMenu, targetRef, targetElement, contextMenuStyle,
        });

        const state = reactive({
            contextMenuRef: null as null|any,
            proxySelected: makeOptionalProxy('selected', vm, props.selected),
            selectedItem: computed<MenuItem|null>(() => {
                if (!Array.isArray(props.items)) return null;

                if (props.indexMode) return props.items[state.proxySelected ?? ''] || null;

                const data = groupBy(props.items, 'name')[state.proxySelected ?? ''];
                if (Array.isArray(data)) return data[0] || null;

                return null;
            }),
            menuSlots: computed(() => reduce(slots, (res, d, name) => {
                if (name.startsWith('menu-')) res[`${name.substring(5)}`] = d;
                return res;
            }, {})),
            buttonSlots: computed(() => reduce(slots, (res, d, name) => {
                if (name.startsWith('button-') || name === 'button-default') {
                    res[`${name.substring(7)}`] = d;
                }
                return res;
            }, {})),
        });


        /* Event Handlers */
        const onSelectMenu = (item: MenuItem, index, event) => {
            if (props.indexMode) {
                emit('select', index, event);
                state.proxySelected = index;
            } else {
                emit('select', item.name, event);
                state.proxySelected = item.name;
            }
            contextMenuFixedStyleState.proxyVisibleMenu = false;
        };
        const handleClick = (e: MouseEvent) => {
            if (props.readOnly || props.disabled) return;
            contextMenuFixedStyleState.proxyVisibleMenu = !contextMenuFixedStyleState.proxyVisibleMenu;
            e.stopPropagation();
        };
        const handleClickOutside = (): void => {
            contextMenuFixedStyleState.proxyVisibleMenu = false;
        };
        const handlePressDownKey = () => {
            if (!contextMenuFixedStyleState.proxyVisibleMenu) contextMenuFixedStyleState.proxyVisibleMenu = true;
            vm.$nextTick(() => {
                if (state.contextMenuRef) {
                    if (slots['menu-menu']) emit('focus-menu');
                    else state.contextMenuRef.focus();
                }
            });
        };
        return {
            ...toRefs(state),
            ...toRefs(contextMenuFixedStyleState),
            handleClickOutside,
            onSelectMenu,
            handleClick,
            handlePressDownKey,
            SELECT_DROPDOWN_STYLE_TYPE,
        };
    },
});
</script>

<style lang="postcss">
@define-mixin disabled-style {
    .dropdown-button {
        @apply bg-gray-100 text-gray-300;
    }
}

@define-mixin disabled-style-filled-bg {
    .dropdown-button {
        @apply bg-gray-200 text-gray-400 border-none;
    }
}

@define-mixin read-only-style {
    .dropdown-button {
        @apply border border-solid border-gray-300 text-gray-900 bg-white;
    }
}

.p-select-dropdown {
    @apply rounded-md;
    position: relative;
    display: inline-block;
    min-width: 6.5rem;

    &.icon-button {
        min-width: unset;
    }

    .dropdown-button {
        @apply border border-solid border-gray-300 rounded-md;
        min-width: unset;
        width: 100%;
        display: inline-flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 0.25rem 0 0.5rem;
        margin-right: -1px;
        font-weight: normal;
        font-size: 0.875rem;
        text-align: left;
        height: 2rem;

        .text {
            flex-grow: 1;
            flex-shrink: 0;
        }
        .dropdown-icon {
            flex-shrink: 0;
        }

        &:focus, &:active {
            @apply border-secondary text-secondary;
            outline: none;
        }
    }

    &.default {
        .dropdown-button {
            @apply bg-white text-gray-900 border-gray-300;
        }
    }
    &.primary-button {
        .dropdown-button {
            @apply border-none bg-violet-800 text-white;
        }
    }
    &.secondary-button {
        .dropdown-button {
            @apply text-violet-800 border-violet-800;
        }
    }
    &.transparent {
        min-width: unset;
        .dropdown-button {
            @apply border-transparent bg-transparent text-gray-900;
            padding-left: 0;
        }
    }

    /* read only */
    &.read-only {
        .dropdown-button {
            cursor: default;
            &:focus {
                color: inherit;
            }
            .dropdown-icon {
                @apply text-gray-300;
            }
        }
        &.icon-button {
            display: none;
        }
        &.primary-button {
            @mixin read-only-style;
        }
        &.secondary-button {
            @mixin read-only-style;
        }
    }

    &.none {
        display: none;
    }

    .p-context-menu {
        position: absolute;
        margin-top: -1px;
        z-index: 1000;
        min-width: 100%;
        width: auto;
    }

    /* disabled */
    &.disabled {
        @mixin disabled-style;
        .dropdown-button {
            cursor: not-allowed;
        }
        &.transparent {
            .dropdown-button {
                @apply bg-transparent;
            }
        }
        &.primary-button {
            @mixin disabled-style-filled-bg;
        }
        &.secondary-button {
            @mixin disabled-style-filled-bg;
        }
    }

    /* invalid */
    &:not(.disabled):not(.read-only).invalid {
        .dropdown-button {
            @apply border border-alert;
            &:focus, &:active {
                @apply border border-alert;
            }
        }
    }

    /* active */
    &:not(.invalid):not(.disabled):not(.read-only).active {
        &.default {
            .dropdown-button {
                @apply border-secondary text-secondary bg-white;
            }
        }
        &.button {
            .dropdown-button {
                @apply border-secondary text-white bg-secondary;
                .dropdown-icon {
                    transform: rotate(180deg);
                }
            }
        }
        &.transparent {
            .dropdown-button {
                @apply text-secondary;
            }
        }
        &.primary-button {
            .dropdown-button {
                @apply text-white bg-blue-600;
            }
        }
        &.secondary-button {
            .dropdown-button {
                @apply border-secondary text-secondary bg-white;
            }
        }
    }

    /* hover */
    &:not(.invalid):not(.disabled):not(.active):not(.read-only) {
        &.default {
            .dropdown-button {
                @media (hover: hover) {
                    &:not(.active):not(.disabled):hover {
                        @apply border-blue-600;
                        .dropdown-icon {
                            @apply text-blue-600;
                        }
                    }
                }
            }
        }
        &.transparent {
            .dropdown-button {
                @media (hover: hover) {
                    &:not(.active):not(.disabled):hover {
                        @apply text-secondary;
                        outline: none;
                    }
                }
            }
        }
        &.primary-button {
            .dropdown-button {
                @media (hover: hover) {
                    &:not(.active):not(.disabled):hover {
                        @apply text-white bg-blue-600;
                        outline: none;
                    }
                }
            }
        }
        &.secondary-button {
            .dropdown-button {
                @media (hover: hover) {
                    &:not(.active):not(.disabled):hover {
                        @apply bg-white text-secondary border-secondary;
                    }
                }
            }
        }
    }

    &:not(.disabled):not(.active).transparent {
        &.default {
            .dropdown-button {
                @media (hover: hover) {
                    &:not(.active):not(.disabled):hover {
                        @apply text-secondary;
                    }
                }
            }
        }
    }
}
</style>
