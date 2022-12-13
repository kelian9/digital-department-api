import IPagination from "../IPagination";
import PublicationTypeEnum from "./PublicationTypeEnum";

interface IPublicationsFilter extends IPagination {
    type?: PublicationTypeEnum[];
    authors?: number[];
    subjects?: number[];
    tags?: number[];
}

export default IPublicationsFilter;
