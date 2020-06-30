import express from "express";
import bodyparser from "body-parser";
import { object, string } from "yup";
import monk from "monk";

const port = process.env.PORT || 8080;

const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = process.env.DB_PORT || '27017';
const dbName = process.env.DB_NAME || 'url_shortner';
const dbUser = process.env.DB_USER || 'root';
const dbPass = process.env.DB_PASSWORD || 'example';
const dbUrl = `${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}`;

const client = monk(dbUrl);
const users = client.get("users");
const urls_shorts = client.get("urls_shorts");

urls_shorts.createIndex({ alias: 1 }, { unique: true });
urls_shorts.createIndex({ destiny: 1 });

users.createIndex({ username: 1 }, { unique: true });
users.createIndex({ password: 1 }, { unique: true });

const postSchema = object<{
    alias: string,
    destiny: string,
    username: string,
    password: string
}>({
    alias: string()
        .required("alias is required")
        .transform((value: string) => value.toLowerCase().trim()),
    destiny: string()
        .required("destiny is required")
        .transform((value: string) => value.toLowerCase().trim())
        .url("destiny should be a url with protocol"),
    username: string()
        .required("username is required")
        .min(5, min => `username should be bigger than ${min} characters`),
    password: string()
        .required("password is required")
        .min(7, min => `password should be bigger than ${min} characters`)
}).required().default({});

const putSchema = object<{
    destiny: string,
    username: string,
    password: string
}>({
    destiny: string()
        .required("destiny is required")
        .transform((value: string) => value.toLowerCase().trim())
        .url("destiny should be a url with protocol"),
    username: string()
        .required("username is required")
        .min(5, min => `username should be bigger than ${min} characters`),
    password: string()
        .required("password is required")
        .min(7, min => `password should be bigger than ${min} characters`)
}).required().default({});

const app = express();
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({
    extended: true,
}));

/**
 * POST /
 * Create a new shortned url if not exists
 * Payload
 * {
 *  alias: string
 *  destiny: url
 *  username: string
 *  password: string
 * }
 * 
 * PUT /:alias
 * Update a existing url
 * {
 *  destiny: url
 *  username: string
 *  password: string
 * }
 * 
 * GET /:alias
 * Redirect to destiny if exist, 404 otherwise
 * 
 * GET /
 * Return form? or 404?
 * 
 */

app.post("/", async (req, resp) => {
    const data = req.body;

    // Check if body is valid
    await postSchema.validate(data, { abortEarly: false }).then(async ({ alias, destiny, username, password }) => {
        await users.findOne({ username, password }).then(async (user) => {
            if (user) {
                await urls_shorts.findOne({ alias }).then(async (short_url) => {
                    if (short_url) {
                        // alias exist
                        resp.send({ error: "Alias already in use 🥶" });
                    } else {
                        await urls_shorts.insert({ alias, destiny })
                        resp.sendStatus(201);
                    }
                })
            } else {
                // Not authed, return not authorized
                resp.sendStatus(401);
            }
        })
    }).catch((err) => {
        resp.send({ errors: err.errors });
    });
});

app.get("/:alias", async (req, resp) => {
    const alias = req.params["alias"];
    // check if alias is in db
    await urls_shorts.findOne({ alias }).then((short_url?: { alias: string, destiny: string } | null) => {
        if (short_url) {
            resp.redirect(301, short_url.destiny);
        } else {
            resp.status(404).send({ error: "Redirect not find 🥺" });
        }
    });
});

app.put("/:alias", async (req, resp) => {
    const alias = req.params["alias"];
    const data = req.body;

    // Check if body is valid
    await putSchema.validate(data, { abortEarly: false }).then(async ({ destiny, username, password }) => {
        // check if alias in db
        await users.findOne({ username, password }).then(async (user) => {
            if (user) {
                await urls_shorts.findOne({ alias }).then(async (short_url) => {
                    if (short_url) {
                        // if in db, update destiny
                        await urls_shorts.update({ alias }, { alias, destiny })
                        resp.sendStatus(202);
                    } else {
                        // else, send 400
                        resp.status(400).send({ error: "Alias not found 😵" });
                    }
                })
            } else {
                // Not authed, return not authorized
                resp.sendStatus(401);
            }
        })
    }).catch((err) => {
        resp.send({ errors: err.errors });
    });

});

app.get("/", (req, resp) => {
    resp.status(200).send({
        info: "This is a url shortner",
        req: req.body
    });
});

app.listen(port, () => {
    console.log(`listening on ${port}`);
});
