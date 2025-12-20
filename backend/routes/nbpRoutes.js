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

//-----------------------------------------------------------------------------
// Routes returns json file in format:
// {
//     status: Boolean,
//     data: [data]
// }
// data in route api/nbp/table/:tableLetter is table of objects with currencies. Eg:
// [
//     {
//       "currency": "bat (Tajlandia)",
//       "code": "THB",
//       "mid": 0.1138
//     },
//     {
//       "currency": "dolar amerykański",
//       "code": "USD",
//       "mid": 3.6818
//     }
// ]
// data in route api/nbp/rate/:tableLetter/:currencyCode  is table of one object
// or few objects if, you will pass date rage. Eg:
// [
//     {
//       "date": "2024-10-01",
//       "rate": 3.859
//     },
//     {
//       "date": "2024-10-02",
//       "rate": 3.8792
//     },
//     {
//       "date": "2024-10-03",
//       "rate": 3.8951
//     }
//   ]
//-----------------------------------------------------------------------------


function getISODate(date) {
    date = new Date(date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
function compareDates(date1, date2) {
    date1 = new Date(date1);
    date2 = new Date(date2);
    return date1.getTime() - date2.getTime();
}

async function getTable(tableType, startDate = null, endDate = null) {
    tableType = tableType.toUpperCase();
    const baseUrl = `https://api.nbp.pl/api/exchangerates/tables/${tableType}`;
    const url = startDate && endDate
        ? `${baseUrl}/${getISODate(startDate)}/${getISODate(endDate)}/?format=json`
        : `${baseUrl}/?format=json`;

    try {
        const response = await axios.get(url);
        const { rates } = response.data[0];
        return { success: true, data: rates };
    } catch (error) {
        console.error('NBP API Error:', error.response?.status, error.response?.data);

        if (error.response) {
            const { status, data } = error.response;
            
            if (status === 404) {
                return { 
                    success: false, 
                    status: 404,
                    message: 'Not Found - Brak danych dla określonego zakresu czasowego'
                };
            }
            
            if (status === 400) {
                const message = data.includes('limit')
                    ? 'Bad Request - Przekroczony limit'
                    : 'Bad Request - Nieprawidłowo sformułowane zapytanie';
                    
                return {
                    success: false,
                    status: 400,
                    message
                };
            }
            
            return {
                success: false,
                status: status,
                message: data || 'Unknown error'
            };
        }
        
        return {
            success: false,
            status: 500,
            message: 'Internal Server Error'
        };
    }
}

async function getCurrencyRate(tableType, code, startDate = null, endDate = null) {
    tableType = tableType.toUpperCase();
    console.warn(endDate);
    
    const baseUrl = `https://api.nbp.pl/api/exchangerates/rates/${tableType}/${code}/`;
    const url = startDate && endDate
        ? `${baseUrl}/${getISODate(startDate)}/${getISODate(endDate)}/?format=json`
        : startDate && !endDate
        ? `${baseUrl}/${getISODate(startDate)}/?format=json`
        : `${baseUrl}/?format=json`;
    try {
        const response = await axios.get(url);
        const { rates } = response.data;
        return { success: true, data: rates };
    } catch (error) {
        console.error('NBP API Error:', error.response?.status, error.response?.data);

        if (error.response) {
            const { status, data } = error.response;
            
            if (status === 404) {
                return { 
                    success: false, 
                    status: 404,
                    message: 'Not Found - Brak danych dla określonego zakresu czasowego'
                };
            }
            
            if (status === 400) {
                const message = data.includes('limit')
                    ? 'Bad Request - Przekroczony limit'
                    : 'Bad Request - Nieprawidłowo sformułowane zapytanie';
                    
                return {
                    success: false,
                    status: 400,
                    message
                };
            }
            
            return {
                success: false,
                status: status,
                message: data || 'Unknown error'
            };
        }
        
        return {
            success: false,
            status: 500,
            message: 'Internal Server Error'
        };
    }
}


// Table A, B, C with optional startDate and endDate
router.get('/table/:tableLetter', async (req, res) => {
    try {
        const { tableLetter } = req.params;
        let { startDate, endDate } = req.query;
        
        if (!['A', 'B', 'C'].includes(tableLetter.toUpperCase())) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid table type' 
            });            
        }
        if (startDate && endDate) {
            if (compareDates(startDate, endDate) > 0) {
                const tempDate = startDate;
                startDate = endDate;
                endDate = tempDate;
            }
        }

        const result = await getTable(tableLetter.toUpperCase(), startDate, endDate);
        
        if (!result.success) {
            return res.status(result.status).json({
                success: false,
                message: result.message
            });
        }

        res.json({
            success: true,
            data: result.data
        });
    } catch (error) {
        console.error('Route error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error'
        });
    }
});

router.get('/rate/:tableLetter/:currencyCode', async (req, res) => {
    try {
        const { tableLetter, currencyCode } = req.params;
        let { startDate, endDate } = req.query;
        
        if (!['A', 'B', 'C'].includes(tableLetter.toUpperCase())) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid table type' 
            });
        }
        if (startDate && endDate) {
            if (compareDates(startDate, endDate) > 0) {
                const tempDate = startDate;
                startDate = endDate;
                endDate = tempDate;
            }
        }

        const result = await getCurrencyRate(tableLetter.toUpperCase(), currencyCode, startDate, endDate);
        
        if (!result.success) {
            return res.status(result.status).json({
                success: false,
                message: result.message
            });
        }

        const newResult = result.data.map(item => {
            return {
                date: item.effectiveDate,
                rate: item.mid
            }
        });

        if (!newResult) {
            return res.status(404).json({
                success: false,
                message: 'Currency not found'
            });
        }

        res.json({
            success: true,
            data: newResult
        });
    } catch (error) {
        console.error('Route error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error'
        });
    }
});

module.exports = router;