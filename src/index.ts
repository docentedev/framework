import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import client from './connection'
import upload from './upload'
import publicRoutes from './public';
import { Post } from './types';
import sendMail from './mail';
import https from 'https';

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

const mainFolder = process.env.PWD || ''
// set the view engine to ejs
app.use(express.json());

app.set('view engine', 'ejs');
app.set('views', path.join(mainFolder, 'views'));
app.use('/static', express.static(path.join(mainFolder, 'public')))
app.use('/files', express.static(path.join(mainFolder, 'files')))
app.use('/media', express.static(path.join(mainFolder, 'uploads')))

upload(app, client)
publicRoutes(app, client)

app.get('/dashboard', (req: Request, res: Response) => {
  res.render('dashboard');
})

const getTextFromHtml = (str: string) => {
  let strippedString = str.replace(/(<([^>]+)>)/gi, "")
  // &nbsp;
  strippedString = strippedString.replace(/&nbsp;/gi, " ")
  return strippedString
  /*
  let regex = '<\/?!?(p|a|strong|li|ul)[^>]*>'
  var re = new RegExp(regex, 'g');
  const out = str.replace(re, '');
  return out
  */
}

const getFirstNChar = (str: string, len: number) => {
  return str.substring(0, len)
}
function seoUrl(str: string) {
  // remove all tilde
  const value = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  return value == undefined ? '' : value.replace(/[^a-z0-9_]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
}

app.get('/dashboard/posts', (req: Request, res: Response) => {
  client.query<Post>('select p.id, f.filename as filename, p.title, p."content", f."extension", p.slug, p.excerpt  from posts as p left join files as f on f.id = p.thumbnail', (err: any, data) => {
    res.render('dashboard-posts', {
      posts: data.rows.map((post) => ({
        ...post,
      })),
    })
  })
});

app.get('/dashboard/endpoints', (req: Request, res: Response) => {
  res.render('dashboard-endpoints', {
    endpoints: [{
      method: 'get',
      url: '/api/v1/files'
    }, {
      method: 'post',
      url: '/api/v1/files',
    }, {
      method: 'get',
      url: '/api/v1/posts'
    }, {
      method: 'post',
      url: '/api/v1/posts',
    }],
  })
})

app.get('/dashboard/posts/create', (req: Request, res: Response) => {
  res.render('dashboard-posts-create')
})

// API
app.get('/api/v1/files', (req: Request, res: Response) => {
  client.query<any>('select * from files', (err: any, data) => {
    res.json(data.rows)
  })
})

app.get('/api/v1/posts', (req: Request, res: Response) => {
  client.query<Post>('select p.id, f.filename as filename, p.title, p."content", f."extension", p.slug, p.excerpt  from posts as p left join files as f on f.id = p.thumbnail', (err: any, data) => {
    res.json(data.rows)
  })
});

app.post('/api/v1/posts', (req: Request, res: Response) => {
  const data = req.body
  const text = `
  INSERT INTO posts 
  (id, title, extra, created_at, updated_at, deleted_at, "content", thumbnail, excerpt, slug) VALUES
  (uuid_generate_v4(), $1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $3, $4, $5, $6)
  RETURNING * `
  const values = [
    data.title,
    { public: true },
    data.content,
    data.thumbnail,
    getFirstNChar(getTextFromHtml(data.content), 70),
    seoUrl(data.title),
  ]
  client.query(text, values, (err, result) => {
    if (err) {
      console.log(err)
    } else {
      res.json(true)
    }

  })
})

// send mail
app.post('/api/v1/contact', (req: Request, res: Response) => {
  /*const data = JSON.stringify({
    secret: process.env.RECAPTCHA_SECRET,
    response: req.body.token
  })*/
  const data = '{}'

  const options = {
    protocol: 'https:',
    hostname: 'www.google.com',
    port: 443,
    path:`/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${req.body.token}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  }

  const reqHttps = https
    .request(options, resHttps => {
      let data = ''

      resHttps.on('data', chunk => {
        data += chunk
      })

      resHttps.on('end', () => {
        console.log(JSON.parse(data))
        sendMail({
          message: req.body.message,
          email: req.body.email,
          name: req.body.name,
        })
        res.json(JSON.parse(data))
      })
    })
    .on('error', err => {
      console.log('Error: ', err.message)

      res.json(err.message)
    })

  reqHttps.write(data)
  reqHttps.end()

});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
