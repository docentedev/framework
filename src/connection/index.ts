import { ClientConfig, Client } from "pg"

const conf: ClientConfig = {
    user: 'postgres' || process.env.PGUSER,
    host: 'localhost' || process.env.PGHOST,
    database: 'framework' || process.env.PGDATABASE,
    password: '' || process.env.PGPASSWORD,
    port: Number.parseInt('5432' || process.env.PGPORT),
}
const client = new Client(conf)
client.connect()

client.query('SELECT NOW()', (err: any, res: any) => {
    if (!err) {
        console.log('DB:UP')
    }
})

export default client;