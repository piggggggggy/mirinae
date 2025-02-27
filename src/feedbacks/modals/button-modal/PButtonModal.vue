<template>
    <section class="p-button-modal">
        <transition v-if="visible" name="modal">
            <div class="modal-mask"
                 :class="[{'no-backdrop':!backdrop}, {'absolute': !!absolute}]"
                 :style="absolute ? [{'top': `${absolute}rem`}, {'left': `${absolute}rem`}] : {}"
            >
                <div class="modal-wrapper" :class="dialogClassObject"
                     role="dialog"
                     aria-modal="true"
                     aria-labelledby="headerTitle"
                     tabindex="1"
                >
                    <article class="modal-content"
                             :class="[`modal-${themeColor}`, {'no-footer': hideFooter}]"
                             :style="absolute ? {'max-height': `calc(100vh - 4rem - ${absolute}rem`} : {}"
                    >
                        <h3 class="header">
                            <slot v-if="!hideHeader" name="header">
                                <div class="modal-header">
                                    <span class="alert-icon">
                                        <p-lottie name="lottie_error" auto :size="1.5"
                                                  :class="[`modal-${themeColor}`]" class="header-lottie"
                                        />
                                    </span>
                                    <span>{{ headerTitle }}</span>
                                </div>
                            </slot>
                            <p-icon-button v-if="!hideHeaderCloseButton"
                                           name="ic_delete" color="inherit"
                                           class="close-button"
                                           :class="[{disabled: loading},
                                                    {'no-footer': hideFooter}]"
                                           @click.stop="onCloseClick"
                            />
                        </h3>
                        <div v-if="!hideBody" class="modal-body" :class="allBodyClass">
                            <slot name="body" />
                        </div>
                        <div v-if="!hideFooter" class="modal-footer">
                            <slot :slot-scope="$props" name="footer-extra" />
                            <p-button
                                v-if="footerResetButtonVisible"
                                class="modal-button reset-button"
                                style-type="gray-border"
                                :disabled="loading"
                                @click="onResetClick"
                            >
                                <slot :slot-scope="$props" name="reset-button">
                                    Reset
                                </slot>
                            </p-button>
                            <p-button v-if="!hideFooterCloseButton"
                                      class="modal-button cancel-button"
                                      style-type="transparent"
                                      :disabled="loading"
                                      @click="onCancelClick"
                            >
                                <slot name="close-button" v-bind="$props">
                                    {{ $t('COMPONENT.BUTTON_MODAL.CANCEL') }}
                                </slot>
                            </p-button>
                            <p-button
                                class="modal-button confirm-button"
                                :class="{'no-cancel-button': hideFooterCloseButton}"
                                :style-type="themeColor"
                                :loading="loading"
                                :disabled="disabled"
                                @click="onConfirmClick"
                            >
                                <slot name="confirm-button" v-bind="$props">
                                    {{ $t('COMPONENT.BUTTON_MODAL.CONFIRM') }}
                                </slot>
                            </p-button>
                        </div>
                    </article>
                </div>
            </div>
        </transition>
    </section>
</template>

<script lang="ts">
import {
    computed, defineComponent, reactive, toRefs,
} from 'vue';

import type { ButtonModalProps } from '@/feedbacks/modals/button-modal/type';
import { THEME_COLORS } from '@/feedbacks/modals/button-modal/type';
import { SizeMapping } from '@/feedbacks/modals/type';
import '@/feedbacks/modals/modal.pcss';
import PLottie from '@/foundation/lottie/PLottie.vue';
import PButton from '@/inputs/buttons/button/PButton.vue';
import PIconButton from '@/inputs/buttons/icon-button/PIconButton.vue';
import { makeProxy } from '@/util/composition-helpers';


export default defineComponent<ButtonModalProps>({
    name: 'PButtonModal',
    components: {
        PIconButton,
        PLottie,
        PButton,
    },
    model: {
        prop: 'visible',
        event: 'update:visible',
    },
    props: {
        visible: { // sync
            type: Boolean,
            default: false,
        },
        size: {
            type: String,
            default: 'md',
            validator: (value: string) => Object.keys(SizeMapping).includes(value),
        },
        backdrop: {
            type: Boolean,
            default: true,
        },
        absolute: {
            type: Number,
            default: undefined,
        },
        themeColor: {
            type: String,
            default: 'primary',
            validator(themeColor: any) {
                return THEME_COLORS.includes(themeColor);
            },
        },
        headerTitle: {
            type: String,
            default: '',
        },
        hideHeader: {
            type: Boolean,
            default: false,
        },
        hideBody: {
            type: Boolean,
            default: false,
        },
        hideFooter: {
            type: Boolean,
            default: false,
        },
        hideHeaderCloseButton: {
            type: Boolean,
            default: false,
        },
        hideFooterCloseButton: {
            type: Boolean,
            default: false,
        },
        footerResetButtonVisible: {
            type: Boolean,
            default: false,
        },
        loading: {
            type: Boolean,
            default: false,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            proxyVisible: makeProxy('visible', props, emit),
            allBodyClass: computed(() => {
                const res: string[] = [];
                if (props.size) res.push(props.size);
                return res;
            }),
        });
        const dialogClassObject = computed(() => [
            props.size,
        ]);
        const hide = () => {
            if (props.visible) { emit('update:visible', false); }
        };
        const show = () => {
            if (!props.visible) { emit('update:visible', true); }
        };
        const toggle = () => {
            emit('update:visible', !props.visible);
        };
        const onCloseClick = () => {
            if (props.loading) return;
            emit('close');
            state.proxyVisible = false;
        };
        const onResetClick = () => {
            if (props.loading) return;
            emit('return');
        };
        const onCancelClick = () => {
            if (props.loading) return;
            emit('cancel');
            state.proxyVisible = false;
        };
        const onConfirmClick = () => {
            emit('confirm');
        };

        return {
            ...toRefs(state),
            dialogClassObject,
            show,
            hide,
            toggle,
            onResetClick,
            onCloseClick,
            onCancelClick,
            onConfirmClick,
        };
    },
});

</script>
<style lang="postcss">
.p-button-modal {
    display: inline-block;
    .modal-content {
        @apply bg-white border border-gray-200 rounded-lg;
        display: flex;
        flex-direction: column;
        width: 100%;
        max-height: calc(100vh - 4rem);
        pointer-events: auto;
        box-shadow: 0 0 0.5rem rgba(theme('colors.gray.900'), 0.32);
        transition: all 0.3s ease;
        justify-content: space-between;
        padding: 2rem 2rem;

        &.no-footer {
            padding-bottom: 2.5rem;
        }

        $header-height: 3.5rem;
        $footer-height: 96px;
        $wrapper-margin: 4rem;
        $body-max-height: calc(100vh - $(header-height) - $(footer-height) - $(wrapper-margin));

        .header {
            display: flex;
            justify-content: space-between;

            .modal-header {
                display: flex;
                align-items: flex-start;
                min-height: $header-height;
                font-size: 1.375rem;
                line-height: 145%;
                .alert-icon {
                    padding-top: 0.25rem;
                }
            }

            .header-lottie {
                display: none;

                &.modal-alert {
                    display: inline-flex;
                    margin-right: 0.5rem;
                }
            }

            .close-button {
                @apply text-gray-400;
                cursor: pointer;

                &:hover {
                    @apply text-secondary;
                }

                &.disabled {
                    @apply text-gray-200;
                }

                &.no-footer {
                    @apply text-gray-900;
                }
            }
        }

        .modal-body {
            flex-grow: 1;
            max-height: $body-max-height;
            min-height: 1.25rem;
            overflow: auto;
            line-height: normal;
        }

        .modal-footer {
            display: flex;
            align-items: center;
            width: 100%;
            padding-top: 1.5rem;
            border: none;

            .modal-button {
                @apply rounded;
                height: 2.5rem;
                font-size: 1rem;
            }

            .cancel-button {
                margin-left: auto;
                margin-right: 1rem;
            }

            .reset-button {
                display: none;

                @screen xs {
                    display: flex;
                }
            }

            .confirm-button.no-cancel-button {
                margin-left: auto;
            }
        }
    }
}

@define-mixin modal-color $color {
    .modal-header {
        color: $color;
    }
}

.modal-primary { @mixin modal-color theme('colors.primary'); }
.modal-primary-dark { @mixin modal-color theme('colors.primary-dark'); }
.modal-primary1 { @mixin modal-color theme('colors.primary1'); }
.modal-primary2 { @mixin modal-color theme('colors.primary2'); }
.modal-secondary { @mixin modal-color theme('colors.secondary'); }
.modal-secondary1 { @mixin modal-color theme('colors.secondary1'); }
.modal-safe { @mixin modal-color theme('colors.gray.900'); }
.modal-alert { @mixin modal-color theme('colors.alert'); }
.modal-gray900 { @mixin modal-color theme('colors.gray.900'); }
.modal-gray { @mixin modal-color theme('colors.gray.default'); }

@screen mobile {
    .modal-mask {
        &.absolute {
            left: 0.75rem !important;
        }
    }
}

</style>
