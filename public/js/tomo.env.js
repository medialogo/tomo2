/*global $, tomo */
tomo.env = (function() {
    var host_name = "localhost:3000", getHostName;
    getHostName = function() {
        return host_name;
    };
    return {getHostName : getHostName};
}());
