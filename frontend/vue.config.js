const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    host: "0.0.0.0",
    port: 8080, // Ha nem szeretnél másik portot, maradhat az alapértelmezett
    proxy: {
      "/api": {
        target: "http://192.168.1.97:3000", // A backend IP és portja
        changeOrigin: true, // Fontos, hogy a CORS problémákat elkerüld
        secure: false, // Ha HTTPS-t használsz, állítsd be true-ra
      },
    },
  },
});
