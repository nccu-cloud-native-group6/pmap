require('dotenv').config();
const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const mqtt = require('mqtt');

const acc = process.env.GMAIL_ACCOUNT;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    'https://developers.google.com/oauthplayground' // 回調網址
);

oAuth2Client.setCredentials({
    refresh_token: REFRESH_TOKEN,
});


let transporter = null;

async function setupTransporter() {
    try {
        const accessToken = await oAuth2Client.getAccessToken();
        
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: acc,
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: accessToken.token,
            },
        });
        console.log('Transporter is ready');
    } catch (error) {
        console.error('Error setting up transporter:', error);
        throw error;
    }
}
setupTransporter();


let mqttClient = mqtt.connect(process.env.MQ_URL);

mqttClient.on("connect", () => {
    mqttClient.subscribe("EMAIL", (err) => { });
    console.log("mqtt connected");
});

async function sendMail(mail) {
    try {
        if (!transporter) {
            console.log('Transporter not found, setting up...');
            await setupTransporter();
        }

        transporter.sendMail(mail, async(error, info) => {
            if (error) {
                console.error('郵件傳送失敗:', error);
                // 如果是認證相關錯誤，嘗試重新設定 transporter
                if (error.code === 'EAUTH' || error.response?.includes('auth')) {
                    console.log('Auth error detected, trying to reset transporter...');
                    await setupTransporter();
                
                    // 重試發送一次，失敗就算了
                    try {
                        await transporter.sendMail(mailOptions);
                    } catch (error) {
                        console.error('Error sending email after retry:', error);
                    }
                }  
            } else {
                console.log('郵件已成功傳送:', info.response);
            }
        });

    } catch (error) {
        console.error('Error sending email:', error);
    }
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
                        text: `There is a new report in your subscription: ${element.nickname}. \nThe rain degree is: ${element.rainDegree}. \nOpen the app for more info!`
                    }
                );
            } else {
                let avgDegree = 0;
                element.rainDegree.forEach(element => {
                    avgDegree += element.avgRainDegree;
                });
                avgDegree /= element.rainDegree.length;
                sendMail(
                    {
                        from: acc,
                        to: element.email,
                        subject: 'pmap notification',
                        text: `There is a new summary in your subscription: ${element.nickname}. \nThe rain degree is: ${avgDegree}. \nOpen the app for more info!`
                    }
                );
            }
        });
    }

});
