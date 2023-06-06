const http = require('http');

const server = http.createServer((req, res) => {

    const url = req.url;

    if (url == "/profile") {
        res.setHeader('Content-Type', 'text/html');
        res.write('<p>This is the profile page.</p>');
        return res.end();
    }
    else if (url == "/") {
        res.setHeader('Content-Type', 'text/html');
        res.write('<p>Cheeseburger</p>');
        return res.end();
    }

    res.setHeader('Content-Type', 'text/html');
    res.write('<p>Page not found</p>');
    return res.end();
})

server.listen(3001);