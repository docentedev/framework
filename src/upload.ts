import { Client } from 'pg'
import { Express, Request, Response } from 'express';
import path from 'path'
import multer from 'multer'
import mime from 'mime-types'

const mainFolder = process.env.PWD || ''
const MAX_MB_FILE_SIZE = process.env.MAX_MB_FILE_SIZE || '5'
// Define the maximum size for uploading
// picture i.e. 1 MB. it is optional
const maxSize = Number.parseInt(MAX_MB_FILE_SIZE) * 1000 * 1000;
const routes = (app: Express, client: Client) => {
    // var upload = multer({ dest: 'Upload_folder_name' })
    // If you do not want to use diskStorage then uncomment it
    var storage = multer.diskStorage({
        destination: function (_req: Request, _file, callback) {
            // Uploads is the Upload_folder_name
            callback(null, path.join(mainFolder, 'uploads'))
        },
        filename: function (_req, file, callback) {
            const fileUnique = file.fieldname + '-' + Date.now() + '.' + mime.extension(file.mimetype)
            const text = "INSERT INTO files (id, filename, extension, route) VALUES(uuid_generate_v4(), $1, $2, $3) RETURNING *"
            const values = [fileUnique, mime.extension(file.mimetype), '']
            client.query(text, values, (err, result) => {
                if (err) {
                    console.log('2) err', err)
                    callback(new Error('Error: Internal DB Error'), fileUnique);
                } else {
                    callback(null, fileUnique)
                }
            })
        }
    })

    const upload = multer({
        storage: storage,
        limits: { fileSize: maxSize },
        fileFilter: (_req, file, callback) => {
            // Set the filetypes, it is optional
            var filetypes = /jpeg|jpg|png/;
            var mimetype = filetypes.test(file.mimetype);
            var extname = filetypes.test(path.extname(file.originalname).toLowerCase());
            if (mimetype && extname) {
                return callback(null, true);
            }
            console.log('1) err')
            callback(new Error('Error: File upload only supports the following filetypes - ' + filetypes));
        }

        // media is the name of file attribute
    }).single('media');

    app.post('/api/v1/files', (req: Request, res: Response) => {
        // Error MiddleWare for multer file upload, so if any
        // error occurs, the image would not be uploaded!
        upload(req, res, (err) => {
            if (err) {
                console.log(err)
                // ERROR occurred (here it can be occurred due
                // to uploading image of size greater than
                // 1MB or uploading different file type)
                //res.send(err)
                res.statusCode = 500
                res.json({
                    result: false,
                })
            }
            else {
                // SUCCESS, image successfully uploaded
                res.json({
                    result: true,
                })
            }
        })
    })
}

export default routes
