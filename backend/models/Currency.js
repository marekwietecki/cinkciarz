class Currency {
    constructor(code, name, ratePLN) {
        this.code = code;
        this.name = name;
        this.rateToPLN = rateToPLN;
    }

    updateRate(newRate) {
        this.rate = newRate;
    }
}

module.exports = Currency;
