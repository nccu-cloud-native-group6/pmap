import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        // 發送請求到後端 API
        const response = await axios.get(`${process.env.BACKEND_API_URL}/api/1.0/weather`, {
            params: req.query,
        });

        // 將後端響應返回給前端
        res.status(200).json(response.data);
    } catch (error: any) {
        // 處理錯誤並返回適當的狀態碼和錯誤消息
        res.status(error.response?.status || 500).json({ error: error.message });
    }
}
