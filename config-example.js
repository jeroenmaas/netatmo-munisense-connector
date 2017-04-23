var Config = {
    munisense: {
        vendor: "",
        secret: "",
        gateway_ip: ""
    },
    devices: [
        {
            id: "12:34:56:78:89:AB",
            eui64: "ffff:ffff:ffff:ffff"
        }
    ],
    netatmo: {
        client_id: "",
        client_secret: "",
        username: "",
        password: ""
    },
    reporting: {
        netatmo_polling_frequency: 1000 * 60,
        report_to_munisense_frequency: 1000 * 60 * 2
    },
    debugMessages: false
};

exports.Config = Config;