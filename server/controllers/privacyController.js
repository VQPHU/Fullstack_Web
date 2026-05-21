import Privacy from "../models/Privacypolicymodel.js";

export const getPrivacy = async (req, res) => {
    try {
        // Lấy bản ghi đầu tiên trong collection Privacy
        const privacy = await Privacy.find();
        // Trả về mảng để khớp với logic PrivacyData[] ở Frontend
        res.status(200).json(privacy);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};