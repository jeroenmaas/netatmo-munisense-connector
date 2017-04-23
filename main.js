var JOA = require('./lib/joa.js');
var netatmo = require('netatmo');

var Cache = require('sync-disk-cache');
var cache = new Cache('last-reports');

var Config = require('./config').Config;
var munisensePropertyMapping = require('./munisense-property-mapping').MunisensePropertyMapping;

JOA("https://joa3.munisense.net/");
JOA.debug = false;

JOA.headers({
    attribute: {
        vendor: Config.munisense.vendor,
        time: true,
        hash: true,
        secret: Config.munisense.secret
    },
    gatewayIdentifier: Config.munisense.gateway_ip
});

var api = new netatmo(Config.netatmo);
setInterval(function () {
    api.getStationsData(function (err, devices) {
        for (var i in devices) {
            var device = devices[i];
            processDevice(device);

            if(device.modules) {
                for(var y in device.modules) {
                    var module = device.modules[y];
                    processDevice(module);
                }
            }
        }
    });
}, Config.reporting.netatmo_polling_frequency);

setInterval(function () {
    if (JOA.getMessages().length == 0) {
        //console.warn("No messages in buffer to send to Munisense. Abort");
        return;
    }

    JOA.post({
        clear: true,
        clearOnlySuccess: false
    }, function (err, response, messages) {
        if (err) {
            console.log("%c Oops an error occured: ", "background: #f00; color: #fff; font-size: 18px");
            console.log(err);
        }

        if (response) {
            if(Config.debugMessages)
                console.log("Reported sensor values to Munisense");
            // console.log("What the backoffice returned: ");
            // console.log(response.parsed);
            // console.log("The messages that were sent: ");
            // console.log(messages.parsed);
        }
    });
}, Config.reporting.report_to_munisense_frequency);

function processDevice(device) {
    var eui64 = getEUI64FromDeviceId(device._id);
    if (!eui64) {
        console.warn("Got results from unregistered device: " + device._id);
        return;
    }

    var result_timestamp = device.dashboard_data.time_utc;
    if (cache.has("device-" + device._id)) {
        var last_timestamp = cache.get("device-" + device._id).value;
        if (last_timestamp >= result_timestamp) {
            return;
        }
    }

    for(var i in device.data_type) {
        var property = device.data_type[i];
        var propertyConfig = munisensePropertyMapping[property];
        if (typeof(device.dashboard_data[property]) == 'undefined') {
            console.warn("Device " + device._id + " does not have property " + property);
            continue;
        }
        var value = Math.round(device.dashboard_data[property] / propertyConfig.scale);
        if (propertyConfig.removeBase) {
            value -= propertyConfig.removeBase / propertyConfig.scale;
        }

        if(Config.debugMessages)
            console.log('sending ' + property + ' of ' + device._id + " value=" + value);
        JOA.addZCLReport(eui64, null, null, propertyConfig.clusterId, propertyConfig.attributeId, propertyConfig.dataTypeId, device.dashboard_data.time_utc * 1000, value);
    }

    if(device.battery_vp) {
        JOA.addZCLReport(eui64, null, null, "0x0001", "0x0120", "0x21", device.dashboard_data.time_utc * 1000, device.battery_vp);
    }
    if(device.battery_percent) {
        JOA.addZCLReport(eui64, null, null, "0x0001", "0x0122", "0x20", device.dashboard_data.time_utc * 1000, device.battery_percent);
    }

    cache.set("device-" + device._id, result_timestamp);
}

function getEUI64FromDeviceId(id) {
    for(var i in Config.devices) {
        var station = Config.devices[i];
        if(station.id == id)
            return station.eui64;
    }

    return null;
}