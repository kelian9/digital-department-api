import https from 'https';
import CloudConvert from 'cloudconvert';
import fs from 'fs';
import ErrorResponse from '../controllers/ErrorResponse';
import path from 'path';

const cloudConvert = new CloudConvert(`eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiYWVmNjdlMjBiOGZmOTMwZTUyZWMwMDI3NjJiZWZkMGE0YzFjNWJhNTQzZDc4NzZmMThiMzA5YWE1ZDY0ZjBlZTRiODA4OGU0ZDIxMWVhZGMiLCJpYXQiOjE2NzA4NjM4NjkuNzg2ODcyLCJuYmYiOjE2NzA4NjM4NjkuNzg2ODczLCJleHAiOjQ4MjY1Mzc0NjkuNzc2OTg4LCJzdWIiOiI2MTI1NTk3MSIsInNjb3BlcyI6WyJ0YXNrLndyaXRlIiwid2ViaG9vay5yZWFkIiwid2ViaG9vay53cml0ZSIsInRhc2sucmVhZCIsInVzZXIucmVhZCIsInByZXNldC5yZWFkIiwicHJlc2V0LndyaXRlIl19.j6_X7WKKbzbdtoYeLCnIZQdQcvVA39uNiu6xuCnNhqsw6fyItmwS76ymVrlv7mOyQG0aH5A6M-aOuZHfraKAFnqI_QIQ9IF-FMjvH6eb3BoHhNFTOjPVkn9ogZHXmJyhGacjl3NKGCB6YYwqNW8PuknzmjffPbvqMXlQyk2_fhJfbYF3w6FxDm5sDSmtRd8Y9ZbbityEgotUaZy5S-Wce92_iPWXA3Dt90znHQjKm6MTMHNts7V02bpG1k0Z9SrwWPIoUpWnBb02dl_jySq_07NkQb3KD6VXp7FPq0suO8JjkYHdtLQYkHvNuBVup-1rPA4qfnXa0rZ1O5jPlOWoZ6iCzKvNhXBpXOmKYc4xWaU-blQ_qJ5KLu9Zu-8sZY6-BdS1xXwAS5F2sRMAKoOt3chy2rqa11mSSl4-fkiIdmH4pVTTlOLK87TAXRZ1WZPY12RdmR3ZdKZE0Ld_vfyrFz8-rwkYiMJHyUAz9vHLD2F7xW7k4VhyWGiV8qwtkGT7jk3h5qSzs6Db7_um2by3xoyjCM76Dkb0vxM-FWxYABnUidlErrfJvnyIIdgHAO8qOh2Hk7KYprrbvTEZ2OeUSxN1LHengJAuJ5unLIfVwWEJ9gjFKoIqEtbPhXIvBgQUzrv4W7wF--PopasxQfJ6BBeZiRqPm-c2hg84BczMLkQ`);


const convertDjvuToPdf = async (djvuFilePath: string) => {
    const contents = fs.readFileSync(path.join(__dirname, '../uploads', djvuFilePath), {encoding: 'base64'});
    let job = await cloudConvert.jobs.create({
        "tasks": {
            "import-djvu": {
                "operation": "import/base64",
                "file": contents,
                "filename": djvuFilePath.slice(0, djvuFilePath.length - 5)
            },
            "convert-djvu": {
                "operation": "convert",
                "input_format": "djvu",
                "output_format": "pdf",
                "engine": "ddjvu",
                "input": [
                    "import-djvu"
                ]
            },
            "export-djvu": {
                "operation": "export/url",
                "input": [
                    "convert-djvu"
                ],
                "inline": false,
                "archive_multiple_files": false
            }
        },
        "tag": "jobbuilder"
    });
    job = await cloudConvert.jobs.wait(job.id);
    const jobs = await cloudConvert.jobs;
    const resultFile = jobs.getExportUrls(job)[0];
    if (!resultFile.url) return new ErrorResponse(500, "Failed while converting file", "Write feedback");
    const writeStream = fs.createWriteStream(path.join(__dirname, '../uploads/' + resultFile.filename));

    https.get(resultFile.url, function(response) {
        response.pipe(writeStream);
    });

    return new Promise((resolve, reject) => {
        writeStream.on('finish', () => resolve(resultFile.filename));
        writeStream.on('error', (e) => {
            console.log(e);
            reject(new ErrorResponse(500, 'Failed while writing converted file into directory', ''))
        });
    });
};

export default convertDjvuToPdf;