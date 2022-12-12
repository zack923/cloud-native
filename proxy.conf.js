/**
 * For more configuration, please refer to https://angular.io/guide/build#proxying-to-a-backend-server
 *
 * Note: The proxy is only valid for real requests, Mock does not actually generate requests, so the priority of Mock will be higher than the proxy
 */
module.exports = {
  /**
   * The following means that all requests are directed to the backend `https://localhost:9000/`
   */
   /*'/': {
     target: 'http://127.0.0.1:5000/',
     secure: false, // Ignore invalid SSL certificates
     changeOrigin: true
   }*/
};
