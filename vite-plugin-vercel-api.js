
/* eslint-disable no-undef */
import path from 'path';
import fs from 'fs';
import { pathToFileURL } from 'url';

export default function vercelApiPlugin() {
    return {
        name: 'vite-plugin-vercel-api',
        configureServer(server) {
            server.middlewares.use(async (req, res, next) => {
                if (!req.url.startsWith('/api/')) {
                    return next();
                }

                const apiName = req.url.replace('/api/', '').split('?')[0];
                const apiFile = path.resolve(process.cwd(), 'api', `${apiName}.js`);

                if (fs.existsSync(apiFile)) {
                    try {
                        // Invalidate cache for hot reloading
                        const timeParam = `?t=${Date.now()}`;
                        const module = await import(pathToFileURL(apiFile).href + timeParam);
                        const handler = module.default;

                        if (typeof handler !== 'function') {
                            console.error(`Handler is not a function in ${apiFile}`);
                            res.statusCode = 500;
                            res.end('Internal Server Error: Invalid Handler');
                            return;
                        }

                        // Mock Vercel/Express-like request object additions if needed
                        req.query = {};
                        const urlObj = new URL(req.url, `http://${req.headers.host}`);
                        urlObj.searchParams.forEach((value, key) => {
                            req.query[key] = value;
                        });

                        // Mock Vercel/Express-like response object
                        const json = (data) => {
                            res.setHeader('Content-Type', 'application/json');
                            res.end(JSON.stringify(data));
                        };

                        const status = (code) => {
                            res.statusCode = code;
                            return { json };
                        };

                        const mockRes = {
                            ...res,
                            status,
                            json,
                            setHeader: (k, v) => res.setHeader(k, v),
                            end: (data) => res.end(data),
                        };

                        // Execute the handler
                        await handler(req, mockRes);

                    } catch (err) {
                        console.error(`Error executing API ${apiName}:`, err);
                        res.statusCode = 500;
                        res.end(`Internal Server Error: ${err.message}`);
                    }
                } else {
                    next();
                }
            });
        },
    };
}
