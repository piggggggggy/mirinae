<template>
    <p-pane-layout class="p-toolbox-table">
        <div class="top-wrapper">
            <slot name="toolbox-top" />
            <p-toolbox :pagination-visible="paginationVisible"
                       :page-size-changeable="pageSizeChangeable"
                       :settings-visible="settingsVisible"
                       :exportable="exportable"
                       :refreshable="refreshable"
                       :searchable="searchable"
                       :sortable="false"
                       :filters-visible="filtersVisible"
                       :search-type="searchType"
                       :this-page.sync="proxyState.thisPage"
                       :page-size.sync="proxyState.pageSize"
                       :total-count="totalCount"
                       :page-size-options="pageSizeOptions"
                       :key-item-sets="keyItemSets"
                       :value-handler-map="valueHandlerMap"
                       :query-tags.sync="proxyState.queryTags"
                       :search-text.sync="proxyState.searchText"
                       :timezone="timezone"
                       @change="emitChange"
                       @export="$emit('export')"
                       @refresh="$emit('refresh')"
                       @click-settings="$emit('click-settings')"
            >
                <template v-if="$scopedSlots['toolbox-left']" #left-area>
                    <div class="toolbox-left">
                        <slot name="toolbox-left" />
                    </div>
                </template>
            </p-toolbox>
            <slot name="toolbox-bottom" />
        </div>

        <p-data-table :fields="fields"
                      :items="items"
                      :sortable="sortable"
                      :selectable="selectable"
                      :multi-select="multiSelect"
                      :col-copy="colCopy"
                      :select-index.sync="proxyState.selectIndex"
                      :sort-by.sync="proxyState.sortBy"
                      :sort-desc.sync="proxyState.sortDesc"
                      :table-style-type="tableStyleType"
                      :striped="striped"
                      :bordered="bordered"
                      :disable-hover="disableHover"
                      :loading="loading"
                      :use-cursor-loading="useCursorLoading"
                      :row-height-fixed="rowHeightFixed"
                      :row-cursor-pointer="rowCursorPointer"
                      :invalid="invalid"
                      :get-row-class-names="getRowClassNames"
                      :get-row-selectable="getRowSelectable"
                      v-on="$listeners"
                      @changeSort="changeSort"
        >
            <template v-for="(_, slot) of $scopedSlots" #[slot]="scope">
                <slot v-if="!slot.startsWith('toolbox')" :name="slot" v-bind="scope" />
            </template>
        </p-data-table>
        <slot name="toolbox-table-bottom" />
    </p-pane-layout>
</template>

<script lang="ts">
import {
    defineComponent, getCurrentInstance, reactive, watch,
} from 'vue';
import type { Vue } from 'vue/types/vue';

import { DATA_TABLE_STYLE_TYPE } from '@/data-display/tables/data-table/config';
import PDataTable from '@/data-display/tables/data-table/PDataTable.vue';
import type { ToolboxTableOptions, ToolboxTableProps } from '@/data-display/tables/toolbox-table/type';
import PPaneLayout from '@/layouts/pane-layout/PPaneLayout.vue';
import { SEARCH_TYPES } from '@/navigation/toolbox/config';
import PToolbox from '@/navigation/toolbox/PToolbox.vue';
import { makeOptionalProxy } from '@/util/composition-helpers';


export default defineComponent<ToolboxTableProps>({
    name: 'PToolboxTable',
    components: {
        PPaneLayout,
        PToolbox,
        PDataTable,
    },
    props: {
        /* data table props */
        loading: {
            type: Boolean,
            default: false,
        },
        fields: {
            type: Array,
            required: true,
            default: () => [],
        },
        items: {
            type: Array,
            default: () => [],
        },
        sortable: {
            type: Boolean,
            default: false,
        },
        sortBy: {
            type: String,
            default: undefined,
        },
        sortDesc: {
            type: Boolean,
            default: undefined,
        },
        colCopy: {
            type: Boolean,
            default: false,
        },
        selectable: {
            type: Boolean,
            default: false,
        },
        selectIndex: {
            type: Array,
            default: undefined,
        },
        multiSelect: {
            type: Boolean,
            default: true,
        },
        useCursorLoading: {
            type: Boolean,
            default: false,
        },
        tableStyleType: {
            type: String,
            default: DATA_TABLE_STYLE_TYPE.default,
        },
        striped: {
            type: Boolean,
            default: false,
        },
        bordered: {
            type: Boolean,
            default: true,
        },
        disableHover: {
            type: Boolean,
            default: false,
        },
        rowHeightFixed: {
            type: Boolean,
            default: true,
        },
        rowCursorPointer: {
            type: Boolean,
            default: false,
        },
        invalid: {
            type: Boolean,
            default: false,
        },
        getRowClassNames: {
            type: Function,
            default: undefined,
        },
        getRowSelectable: {
            type: Function,
            default: undefined,
        },
        /* toolbox props */
        paginationVisible: {
            type: Boolean,
            default: true,
        },
        pageSizeChangeable: {
            type: Boolean,
            default: true,
        },
        settingsVisible: {
            type: Boolean,
            default: false,
        },
        exportable: {
            type: Boolean,
            default: false,
        },
        refreshable: {
            type: Boolean,
            default: true,
        },
        searchable: {
            type: Boolean,
            default: true,
        },
        filtersVisible: {
            type: Boolean,
            default: true,
        },
        searchType: {
            type: String,
            default: SEARCH_TYPES.plain,
        },
        thisPage: {
            type: Number,
            default: undefined,
        },
        pageSize: {
            type: Number,
            default: undefined,
        },
        totalCount: {
            type: Number,
            default: 0,
        },
        pageSizeOptions: {
            type: Array,
            default: () => [15, 30, 45],
        },
        sortByOptions: {
            type: Array,
            default: () => [],
        },
        keyItemSets: {
            type: Array,
            default: () => [],
        },
        valueHandlerMap: {
            type: Object,
            default: () => ({}),
        },
        queryTags: {
            type: Array,
            default: undefined,
        },
        searchText: {
            type: String,
            default: undefined,
        },
        timezone: {
            type: String,
            default: 'UTC',
        },
    },
    setup(props: ToolboxTableProps, { emit }) {
        const vm = getCurrentInstance()?.proxy as Vue;

        const proxyState = reactive({
            selectIndex: makeOptionalProxy<number[]>('selectIndex', vm, [], ['select']),
            sortBy: makeOptionalProxy<string>('sortBy', vm, ''),
            sortDesc: makeOptionalProxy<boolean>('sortDesc', vm, true),
            thisPage: makeOptionalProxy<number>('thisPage', vm, 1),
            pageSize: makeOptionalProxy<number>('pageSize', vm, 15),
            queryTags: makeOptionalProxy<number>('queryTags', vm, []),
            searchText: makeOptionalProxy<number>('searchText', vm, ''),
        });


        const emitChange = (options: ToolboxTableOptions) => {
            emit('change', options);
        };

        const changeSort = (sortBy, sortDesc) => {
            proxyState.thisPage = 1;
            emitChange({ sortBy, sortDesc });
        };

        const checkSelectIndex = () => {
            if (!Array.isArray(props.items)) return;
            const selectIndex: number[] = [];
            proxyState.selectIndex.forEach((d) => {
                if (props.items[d] !== undefined) selectIndex.push(d);
            });
            if (proxyState.selectIndex.length !== selectIndex.length) {
                proxyState.selectIndex = selectIndex;
            }
        };

        watch(() => props.items, () => {
            checkSelectIndex();
        });

        watch(() => proxyState.thisPage, () => {
            proxyState.selectIndex = [];
        }, { immediate: false });

        return {
            proxyState,
            changeSort,
            emitChange,
        };
    },
});
</script>

<style lang="postcss">
.p-toolbox-table {
    @apply flex flex-col bg-white border border-gray-200 rounded-xs;

    .top-wrapper {
        @apply flex flex-col rounded-xs;
    }
    .p-data-table {
        overflow: auto;
    }

    .p-toolbox {
        padding: 1.5rem 1rem 0.5rem;
    }
    .toolbox-left {
        display: flex;
    }
}
</style>
