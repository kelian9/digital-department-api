import { SortByEnum, SortOrderEnum } from './SortingEnum';
interface IPagination {
    page: number;
    pageSize: number;
    sortBy?: SortByEnum;
    sortOrder?: SortOrderEnum;
}

export default IPagination;
