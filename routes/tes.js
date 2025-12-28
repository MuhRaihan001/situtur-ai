const { Meta } = require("../handler/meta");

module.exports = {
    GET: {
        params: '/:name',
        handler: async function (req, res) {
            const name = req.params.name;
            res.send(`Hello, ${name}! Welcome to the TES route.`);
        },
        meta: new Meta()
            .setSummary("Greet User by Name")
            .setDescription("Returns a greeting message that includes the user's name provided in the URL parameter.")
            .setTags("Tes")
            .addSuccessResponse(200, "Successful Response", {
                type: "object",
                properties: {
                    message: { type: "string", example: "Hello, John! Welcome to the TES route." }
                }
            })
    }
}