import mongoose from "mongoose";

const termsConditionsSchema = mongoose.Schema(
    {
        acceptanceOfTerms: {
            title:   { type: String, required: true },
            content: { type: String, required: true },
        },

        useLicense: {
            title:   { type: String, required: true },
            content: { type: String, required: true },
            items:   [{ type: String, required: true }],
        },

        productInformation: {
            title:   { type: String, required: true },
            content: { type: String, required: true },
        },

        pricingAndPayment: {
            title:   { type: String, required: true },
            content: { type: String, required: true },
            items:   [{ type: String, required: true }],
        },

        shippingAndDelivery: {
            title:   { type: String, required: true },
            content: { type: String, required: true },
        },

        returnsAndExchanges: {
            title:  { type: String, required: true },
            content: { type: String, required: true },
            items:  [{ type: String, required: true }],
        },

        accountRegistration: {
            title:   { type: String, required: true },
            content: { type: String, required: true },
        },

        limitationOfLiability: {
            title:   { type: String, required: true },
            content: { type: String, required: true },
        },

        privacyPolicy: {
            title:   { type: String, required: true },
            content: { type: String, required: true },
        },

        governingLaw: {
            title:   { type: String, required: true },
            content: { type: String, required: true },
        },

        contactInformation: {
            title:   { type: String, required: true },
            content: { type: String, required: true },
            email:   { type: String, required: true },
            phone:   { type: String, required: true },
            address: { type: String, required: true },
        },

        lastUpdated: { type: Date, required: true },
    },
    {
        timestamps: true,
    }
);

const TermsConditions = mongoose.model("TermsConditions", termsConditionsSchema);

export default TermsConditions;