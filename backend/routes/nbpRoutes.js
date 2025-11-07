const express = require('express');
const router = express.Router();
const axios = require('axios');

//-----------------------------------------------------------------------------
// Tables types:
// A - average price of the supported currencies from the day
// B - avarage price of the rest currencies from the day
// C - sell and buy prices of the supported currencies
// get() return rate of ONE foreign currency to x PLN, where x in returned json
//-----------------------------------------------------------------------------

// {date}, {startDate}, {endDate} – data w formacie RRRR-MM-DD (standard ISO 8601)

function getISODate(date) {
    date = new Date(date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

async function getTable(tableType, startDate = null, endDate = null) {
    if (startDate && endDate) {
        // Transforms data to ISO 8601
        startDate = getISODate(startDate);
        endDate = getISODate(endDate);

        try {
            const table = await axios.get(`https://api.nbp.pl/api/exchangerates/tables/${tableType}/${startDate}/${endDate}/?format=json`).then(response => response.data);
            const { rates } = table[0];
            return rates;
        } catch (error) {
            console.error(error);
        }
    } else {
        try {
            const table = await axios.get(`https://api.nbp.pl/api/exchangerates/tables/${tableType}/?format=json`).then(response => response.data);
            const { rates } = table[0];
            return rates;
        } catch (error) {
            console.error(error);
        }
    }
}


// Table A
router.get('/table/a', async (req, res) => {
    try {
        res.json(await getTable('A'));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Could not fetch data' });
    }
});

// Table B
router.get('/table/b', async (req, res) => {
    try {
        res.json(await getTable('B'));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Could not fetch data' });
    }
});


// Table C
router.get('/table/c', async (req, res) => {
    try {
        res.json(await getTable('C'));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Could not fetch data' });
    }
});

router.get('/table/d', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        res.json(await getTable('C', startDate, endDate));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Could not fetch data' });
    }
});

module.exports = router;