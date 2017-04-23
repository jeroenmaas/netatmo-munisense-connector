var MunisensePropertyMapping = {
    "CO2": {
        clusterId: "0x940a",
        attributeId: "0x0000",
        dataTypeId: "0x21",
        scale: 10
    },
    "Pressure": {
        clusterId: "0x9504",
        attributeId: "0x0000",
        dataTypeId: "0x21",
        scale: 0.01,
        removeBase: 800
    },
    "Noise": {
        clusterId: "0x9400",
        attributeId: "0x0000",
        dataTypeId: "0x21",
        scale: 0.01
    },
    "Temperature": {
        clusterId: "0x0402",
        attributeId: "0x0000",
        dataTypeId: "0x29",
        scale: 0.01
    },
    "Humidity": {
        clusterId: "0x0405",
        attributeId: "0x0000",
        dataTypeId: "0x21",
        scale: 0.01
    }
};

exports.MunisensePropertyMapping = MunisensePropertyMapping;