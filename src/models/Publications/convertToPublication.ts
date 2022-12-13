const convertToPublication = (row: any) => {
    let publication: any = {};
    Object.entries(row).forEach(([key, value]: [string, any]) => {
        if (key === 'total_count') {
            return;
        }
        const keyParts: string[] = key.split('_').map((part: string, index: number) => {
            if (index > 0) return part[0].toUpperCase() + part.slice(1);
            return part;
        });
        publication[keyParts.join('') as string] = value;
    });
    ['authors', 'tags', 'subjects'].forEach(key => {
        if (
            Array.isArray(publication[key])
            && publication[key].length === 1
            && publication[key][0].id === null
        ) {
            publication[key] = [];
        }
    })
    if (publication.isFavourite === null) publication.isFavourite = false;
    return publication;
};

export default convertToPublication;
