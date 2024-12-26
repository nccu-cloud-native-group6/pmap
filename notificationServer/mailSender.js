require('dotenv').config();
const nodemailer = require('nodemailer');
const mqtt = require('mqtt');

const acc = process.env.GMAIL_ACCOUNT
const pwd = process.env.GMAIL_PASSWORD

// 設定傳送郵件的 transporter
const transporter = nodemailer.createTransport({
    service: "Gmail", 
    auth: {
        user: acc, 
        pass: pwd 
    }
});

let mqttClient = mqtt.connect("mqtt://localhost:1883");

mqttClient.on("connect", () => {
    mqttClient.subscribe("EMAIL", (err) => { });
    console.log("mqtt connected");
});

function sendMail(mail) {
    transporter.sendMail(mail, (error, info) => {
        if (error) {
            console.error('郵件傳送失敗:', error);
        } else {
            console.log('郵件已成功傳送:', info.response);
        }
    });
}

mqttClient.on("message", (topic, message) => {
    data = JSON.parse(message.toString());
    if (data.length > 0) {
        console.log(data);
        // 設定郵件內容
        data.forEach(element => {
            if (element.hasOwnProperty('reportId')) {
                sendMail(
                    {
                        from: acc, 
                        to: element.email, 
                        subject: 'pmap notification', 
                        text: 'there is a new report in your subscription location. open the app to check it out!'
                    }
                );
            }else{
                sendMail(
                    {
                        from: acc, 
                        to: element.email, 
                        subject: 'pmap notification', 
                        text: 'there is a new summary in your subscription location. open the app to check it out!'
                    }
                );
            }
        });
    }

});
