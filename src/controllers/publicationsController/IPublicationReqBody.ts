import IAuthor from "../../models/Authors/IAuthor";
import PublicationTypeEnum from "../../models/Publications/PublicationTypeEnum";

interface IPublicationReqBody {
    type: PublicationTypeEnum;
    title: string;
    review: string;
    cover: string | null;
    file: string;
    authors: IAuthor[];
    subjects: any[];
    tags: any[];
    releaseDate: Date | string;
}

export default IPublicationReqBody;
