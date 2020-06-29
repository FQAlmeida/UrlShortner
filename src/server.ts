import express from "express";
import bodyparser from "body-parser";
import { object, string } from "yup";

const app = express();
const port = process.env.PORT || 8080;

const postSchema = object<{
    alias: string,
    destiny: string
}>({
    alias: string()
        .required("alias is required"),
    destiny: string()
        .required("destiny is required")
        .url("destiny should be a url with protocol")
}).required().default({});

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
 * }
 * 
 * PUT /:alias
 * Update a existing url
 * {
 *  destiny: url
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
    await postSchema.validate(data).then(info => {
        // Check if alias is in db
        console.log(info);
        resp.sendStatus(201);
    }).catch((err) => {
        resp.send({ errors: err.errors })
    });

});

app.get("/:alias", (req, resp)=> {
    const alias = req.params["alias"];
    // check if alias is in db
    // if in db, redirect
    // else, send 404 || 400
    resp.redirect(301, "http://google.com");
})

app.put("/:alias", (req, resp)=> {
    const alias = req.params["alias"];

    // check payload
    // check if alias in db
    // if in db, update destiny
    // else, send 400
    resp.sendStatus(202);
})

app.get("/", (req, resp) => {
    resp.status(200).send({
        info: "This is a url shortner",
        req: req.body
    })
});

app.listen(port, () => {
    console.log(`listening on ${port}`);
});
