interface ICommentReqBody {
    publicationId: number;
    text: string;
    assets?: {
        extension: string,
        name: string,
        path: string,
    }[];
}

export default ICommentReqBody;
