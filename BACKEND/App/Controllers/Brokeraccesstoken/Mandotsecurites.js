var sha256 = require('sha256');
var axios = require('axios');
var dateTime = require('node-datetime');

"use strict";
const db = require('../../Models');
const panel_model = db.panel_model;
const User = db.user;
const user_logs = db.user_activity_logs;
const BrokerResponse = db.BrokerResponse;
const Broker_information = db.Broker_information;
const live_price = db.live_price;


const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;


class mandotsecurities {


    async GetAccessTokenmandotsecurities(req, res) {
        try {
            const { _id ,system_ip} = req.body;

            if (!_id) {
                return res.send({ status: false, data: [], msg: "User ID is required" });
            }

            const userData = await User.findOne({ _id: new ObjectId(_id) }).select('TradingStatus api_secret api_key');
           

            if (!userData) {
                return res.status(404).send({ status: false, data: [], msg: "User does not exist" });
            }

            if (userData.TradingStatus === "on") {
                return res.send({ status: false, data: [], msg: "Trading is already on" });
            }

            if (!userData.api_key || !userData.api_secret) {
                return res.send({ status: false, data: [], msg: "API Key or Secret is missing" });
            }

            const data = JSON.stringify({
                secretKey: userData.api_secret,
                appKey: userData.api_key,
                source: "WebAPI"
            });

            const config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: 'https://webtrade.mandotsecurities.com/interactive/user/session',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: data
            };

            const response = await axios.request(config);
            // console.log("API Response:", response.data);

            if (response.data.type == "success") {
                const result = await User.findByIdAndUpdate(
                    { _id: userData._id},
                    {
                        access_token: response.data.result.token,
                        TradingStatus: "on"
                    },
                    { new: true }
                );

                const user_logs1 = new user_logs({
                    user_Id: userData._id,
                    trading_status: "Trading On",
                    role: "USER",
                    device: "WEB",
                    system_ip: system_ip ?system_ip :""
                });
                await user_logs1.save();

                return res.send({ status: true, data: [], msg: "Trading On Successfully" });
            } else {
                const user_logs1 = new user_logs({
                    user_Id: userData._id,
                    trading_status: response.data.message,
                    role: "USER",
                    device: "WEB",
                    system_ip: system_ip?system_ip:""
                });
                await user_logs1.save();

                return res.send({ status: true, data: [], msg: response.data.message });
            }

        } catch (error) {
            console.error("Error Catch -", error.response ? error.response.data : error.message);
            return res.send({ status: false, data: error.response ? error.response.data : error.message, msg: "Error occurred while retrieving access token" });
        }
    }


    // UPDATE ALL CLIENT BROKER RESPONSE
    async GetOrderFullInformationAngel(req, res, user_info) {

        try {
            const { user_id } = req.body

            if (!user_id) {
                return res.send({ status: false, msg: 'Please Fill All Feild', data: [] });
            }

            GetAllBrokerResponse(user_info, res)


        } catch (error) {
            console.log("Error Some Error In Order information get -", error);
            return res.send({ status: false, msg: 'error in Server side', data: error });

        }


    }

}

const GetAllBrokerResponse = async (user_info, res) => {
    try {
        const objectId = new ObjectId(user_info[0]._id);
        // var FindUserAccessToken = await User.find({ _id: objectId }).limit(1);
        var FindUserBrokerResponse = await BrokerResponse.find({ user_id: objectId, order_view_status: "0" })

        if (FindUserBrokerResponse.length > 0) {

            FindUserBrokerResponse.forEach((data1) => {
                var config = {
                    method: 'get',
                    url: 'https://apiconnect.angelbroking.com/rest/secure/angelbroking/order/v1/getOrderBook',
                    headers: {
                        'Authorization': 'Bearer ' + user_info[0].access_token,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-UserType': 'USER',
                        'X-SourceID': 'WEB',
                        'X-ClientLocalIP': 'CLIENT_LOCAL_IP',
                        'X-ClientPublicIP': 'CLIENT_PUBLIC_IP',
                        'X-MACAddress': 'MAC_ADDRESS',
                        'X-PrivateKey': user_info[0].api_key
                    },
                };
                axios(config)
                    .then(async (response) => {

                        if (response.data.data.length > 0) {

                            const result_order = response.data.data.find(item2 => item2.orderid === data1.order_id);
                            if (result_order != undefined) {

                                var reject_reason;
                                if (result_order.text) {
                                    reject_reason = result_order.text;
                                } else {
                                    reject_reason = '';
                                }

                                const message = (JSON.stringify(result_order));

                                let result = await BrokerResponse.findByIdAndUpdate(
                                    { _id: data1._id },
                                    {
                                        order_view_date: message,
                                        order_view_status: '1',
                                        order_view_response: result_order.status,
                                        reject_reason: reject_reason

                                    },
                                    { new: true }
                                )

                            } else {


                                const message = (JSON.stringify(result_order));

                                let result = await BrokerResponse.findByIdAndUpdate(
                                    { _id: data1._id },
                                    {
                                        order_view_date: message,
                                        order_view_status: '1',

                                    },
                                    { new: true }
                                )

                            }


                        } else {
                        }


                    })
                    .catch(async (error) => {

                    });



            })
            res.send({ status: true, msg: "broker response updated successfully" })

        } else {
            res.send({ status: false, msg: "no user found" })
        }

    } catch (error) {
        console.log("Error in broker response in order Id".error);
    }


}

module.exports = new mandotsecurities();



