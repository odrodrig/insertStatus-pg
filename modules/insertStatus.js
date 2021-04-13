"use strict"

const { Client } = require('pg')
const Pool = require('pg').Pool
const fs = require('fs')
var pool;
var response = {};

/*
export db_user=postgres
export db_port=5432
export db_name=postgres
export db_pass=mysecretpassword
export db_host=localhost
*/

module.exports = async (req) => {
    if(!pool) {
        const poolConf = {
            user: process.env["db_user"],
            host: process.env["db_host"],
            database: process.env["db_name"],
            password: process.env["db_pass"],
            port: process.env["db_port"],
        };

        console.log(poolConf);

        pool = new Pool(poolConf);

        const client = await pool.connect();

        // if (!client) {

        //     response = {
        //         "status": 500,
        //         "msg": "pool"
        //     };
        //     return response;
        // }

        let deviceKey = req.headers["x-device-key"]
        let deviceID = req.headers["x-device-id"]

        if(deviceKey && deviceID) {

            await client.query("SELECT device_id, device_key FROM device WHERE device_id = $1 and device_key = $2", [deviceID,deviceKey])
            .then(({ rows }) => {
                console.log("first query")
                
                if(rows.length) {
                    insertStatus(req, client)
                    .then(() => {
                        console.log("success");
                        response = {
                            "status": 200,
                            "msg": "success"
                        };
                        release();
                        return response;
                    })
                    .catch(() => {
                        response = {
                            "status": 500,
                            "msg": "Couldn't insert"
                        };
                        release();
                        return response;
                    })
                } else {
                    response = {
                        "status": 401,
                        "msg": "unauthorized"
                    };
                    release();
                    return response;
                }
            })        
        }

        response = {
            "status": 200,
            "msg": "No Action"
        };
        release();
        return response;

    }
    
}

async function insertStatus(req, client) {
    let id = req.headers["x-device-id"];
    let uptime = req.body.uptime;
    let temperature = req.body.temperature;

    try {
        queryResponse = await client.query('INSERT INTO device_status (device_id, uptime, temperature_c) values($1, $2, $3)',
        [id, uptime, temperature]);
        console.log(queryResponse)
    } catch(e) {
        console.error(queryResponse)
    }
}