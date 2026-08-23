// Refuses to build while the dev server is up.
//
// `next build` rewrites .next, which is the directory `next dev` is serving
// from. Doing both at once takes the dev server down with an Internal Server
// Error and the cause is not obvious from the page. That happened twice while
// building this site, so it is now blocked rather than remembered.
//
// Setting distDir for production was the other candidate fix, but it also
// relocates the static export out of out/, which would break deploys.
const net = require("node:net");

const PORT = Number(process.env.PORT || 3210);

const socket = net
  .connect({ port: PORT, host: "127.0.0.1" })
  .setTimeout(700)
  .on("connect", () => {
    socket.destroy();
    console.error(
      `\n  Dev server is running on port ${PORT}.\n` +
        `  Building now would rewrite .next underneath it and take it down.\n\n` +
        `  Stop the dev server first, then run the build again.\n`
    );
    process.exit(1);
  })
  .on("timeout", () => {
    socket.destroy();
    process.exit(0);
  })
  .on("error", () => process.exit(0));
