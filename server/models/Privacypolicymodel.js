import mongoose from "mongoose";

const privacyPolicySchema = mongoose.Schema(
    {
        introduction: {
            title: { type: String, required: true },
            content: { type: String, required: true },
        },

        informationWeCollect: {
            title: { type: String, required: true },
            personalInformation: {
                subtitle: { type: String, required: true },
                items: [{ type: String, required: true }],
            },
            usageInformation: {
                subtitle: { type: String, required: true },
                items: [{ type: String, required: true }],
            },
        },

        howWeUseYourInformation: {
            title: { type: String, required: true },
            items: [{ type: String, required: true }],
        },

        informationSharing: {
            title: { type: String, required: true },
            content: { type: String, required: true },
            items: [{ type: String, required: true }],
        },

        dataSecurity: {
            title: { type: String, required: true },
            content: { type: String, required: true },
        },

        yourRights: {
            title: { type: String, required: true },
            items: [{ type: String, required: true }],
        },

        cookies: {
            title: { type: String, required: true },
            content: { type: String, required: true },
        },

        contactUs: {
            title: { type: String, required: true },
            content: { type: String, required: true },
            email: { type: String, required: true },
            phone: { type: String, required: true },
            address: { type: String, required: true },
        },

        lastUpdated: { type: Date, required: true },
    },
    {
        timestamps: true,
    }
);


const PrivacyPolicy =
    mongoose.models.PrivacyPolicy ||
    mongoose.model("PrivacyPolicy", privacyPolicySchema);

export default PrivacyPolicy;