const http = require("http");
const url = require("url");
module.exports = function (context, req) {
    context.log('Proxy triggered');

    const MSI_ENDPOINT = process.env.MSI_ENDPOINT;
    const MSI_SECRET = process.env.MSI_SECRET;
    const MSIPROXY_SECRET = process.env.MSIPROXY_SECRET;

    if (!MSIPROXY_SECRET) {
        context.log.error("Environment variable MSIPROXY_SECRET NOT DEFINED!");
        context.res = {
            body: "Environment variable MSIPROXY_SECRET NOT DEFINED!",
            status: 500
        };
        context.done();
    }

    if (!(MSI_SECRET && MSI_ENDPOINT)) {
        context.log.error("MSI is not turned on");
        context.res = {
            body: "MSI is not turned on",
            status: 500
        };
        context.done();
    }

    if (req.headers.secret !== MSIPROXY_SECRET) {
        context.res = {
            body: "Invalid secret key in header 'secret'",
            status: 401
        };
        return context.done();
    }

    const getToken = function(queryParameters) {
        return new Promise((resolve, reject) => {
            const queryString = Object.keys(queryParameters)
                .map((queryKey) => `${queryKey}=${encodeURIComponent(queryParameters[queryKey])}`)
                .join("&");
            const parsed = url.parse(MSI_ENDPOINT);                            
            const path = `${parsed.pathname}?${queryString}`;
            context.log.info(`Path: ${path}`);
            const options = {
                method: "GET",
                host: parsed.hostname,
                port: parsed.port,
                path: path,
                headers: {
                    'Secret': MSI_SECRET
                }
            };
            const request = http.request(options, (res) => {
                let data = "";
                res.on("data", (chunk) => data += chunk);
                res.on("end", () => {
                    data = JSON.parse(data); // for some reason the function framework is trying to
                                             // serialize that, so we need to deserialize it first...
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        body: data
                    });
                });
            })
            .on("error", (err) => reject(err));
            request.end();
        });
    };

    getToken(req.query)
        .then((res) => {
            context.res = res;
            context.done();
        }).catch((err) => {
            context.res = {
                status: 500,
                body: "Proxy failed: " + err + err.stack
            }
            context.done();
        });
};
