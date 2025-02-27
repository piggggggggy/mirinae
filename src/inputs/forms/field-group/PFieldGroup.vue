<template>
    <div class="p-field-group">
        <div class="label-box">
            <p-label v-if="label || $scopedSlots.label" class="form-label" @click="$emit('click-label')">
                <slot name="label">
                    {{ label }}
                </slot>
                <span v-if="!required" class="optional-mark">({{ $t('COMPONENT.FIELD_GROUP.OPTIONAL') }})</span>
                <slot name="label-extra" />
            </p-label>
        </div>
        <small v-if="$scopedSlots.help || helpText" class="help-msg">
            <slot name="help">{{ helpText }}</slot>
        </small>
        <slot name="default" v-bind="$props" />
        <div v-if="invalidText" class="invalid-feedback" :style="{display: invalid? 'block':'none'}">
            <slot name="invalid">
                {{ invalidText }}
            </slot>
        </div>
        <div v-if="validText" class="valid-feedback" :style="{display: valid&&!invalid? 'block':'none'}">
            <slot name="valid">
                {{ validText }}
            </slot>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import PLabel from '@/data-display/label/PLabel.vue';

export default defineComponent({
    name: 'PFieldGroup',
    components: { PLabel },
    props: {
        label: {
            type: String,
            default: '',
        },
        helpText: {
            type: String,
            default: '',
        },
        invalidText: {
            type: String,
            default: '',
        },
        validText: {
            type: String,
            default: '',
        },
        invalid: {
            type: Boolean,
            default: false,
        },
        valid: {
            type: Boolean,
            default: false,
        },
        required: {
            type: Boolean,
            default: false,
        },
    },
});
</script>

<style lang="postcss">
.p-field-group {
    margin-bottom: 1rem;
    .label-box {
        display: flex;
        align-items: center;
    }
    .optional-mark {
        @apply text-gray-500;
        font-size: 0.75rem;
        line-height: 1.4;
        margin-left: 0.25rem;
        margin-bottom: 0.25rem;
        font-weight: normal;
    }
    .help-msg {
        @apply block mb-2;
    }
    .invalid-feedback {
        @apply text-alert;
        font-size: 0.75rem;
        line-height: 0.875rem;
        margin-top: 0.25rem;
    }
    .valid-feedback {
        @apply text-safe;
        font-size: 0.75rem;
        line-height: 0.875rem;
        margin-top: 0.25rem;
    }
    small {
        font-size: 0.75rem;
    }
    .is-invalid {
        @apply border border-alert;
    }
}

</style>
