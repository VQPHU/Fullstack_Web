import mongoose from "mongoose";

const aboutSchema = mongoose.Schema(
    {
        story: {
            title:   { type: String, required: true },
            content: { type: String, required: true },
        },
        mission: {
            title:   { type: String, required: true },
            content: { type: String, required: true },
        },
        whyChooseUs: {
            title: { type: String, required: true },
            items: [
                {
                    title:       { type: String, required: true },
                    description: { type: String, required: true },
                },
            ],
        },
        commitment: {
            title:   { type: String, required: true },
            content: { type: String, required: true },
        },
    },
    {
        timestamps: true,
    }
);

const About = mongoose.model("About", aboutSchema);

export default About;