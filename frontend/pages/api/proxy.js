// pages/api/proxy.js
import axios from 'axios';

export default async function handler(req, res) {
    try {
        const response = await axios.get(`${process.env.BACKEND_API_URL}/api/1.0/weather`, {
            params: req.query,
        });
        res.status(200).json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: error.message });
    }
}
