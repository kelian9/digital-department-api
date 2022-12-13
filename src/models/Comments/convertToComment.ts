const convertToComment = (row: any) => {
    let comment: any = {};
    Object.entries(row).forEach(([key, value]: [string, any]) => {
        if (key === 'total_count') {
            return;
        }
        const keyParts: string[] = key.split('_').map((part: string, index: number) => {
            if (index > 0) return part[0].toUpperCase() + part.slice(1);
            return part;
        });
        comment[keyParts.join('') as string] = value;
    });
    ['assets'].forEach(key => {
        if (
            Array.isArray(comment[key])
            && comment[key].length === 1
            && comment[key][0].path === null
        ) {
            comment[key] = [];
        }
    })
    return comment;
}

export default convertToComment;
