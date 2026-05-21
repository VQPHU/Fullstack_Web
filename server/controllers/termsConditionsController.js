import TermsConditions from "../models/termsConditionsModel.js";

export const getTermsConditions = async (req, res) => {
    try {
        const termsConditions = await TermsConditions.findOne().sort({ createdAt: -1 });

        if (!termsConditions) {
            return res.status(404).json({ message: "Terms and conditions not found" });
        }

        res.status(200).json(termsConditions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};