import Component from "../models/componentModel.js";
import PageComponent from "../models/pageComponentModel.js";
import { COMPONENT_MAP } from ".././config/componentMap.js";

export const getHomepage = async (req, res) => {
    try {
        const components = await Component.find({ isActive: true });

        const result = await Promise.all(
            components.map(async (comp) => {
                const handler = COMPONENT_MAP[comp.name];

                if (!handler) {
                    return {
                        name: comp.name,
                        data: [],
                    };
                }

                const data = await handler();

                return {
                    name: comp.name,
                    data,
                };
            })
        );

        res.json({
            components: result,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch homepage" });
    }
};

export const getAllComponents = async (req, res) => {
    try {
        const components = await Component.find();
        res.json({ components });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch components" });
    }
};

export const updateComponent = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        const component = await Component.findByIdAndUpdate(
            id,
            { isActive },
            { new: true }
        );

        if (!component) {
            return res.status(404).json({ error: "Component not found" });
        }

        // If the master component type is globally disabled, also deactivate all
        // existing PageComponent documents that reference this type so they
        // become inactive on the website.
        if (isActive === false) {
            try {
                await PageComponent.updateMany(
                    { componentType: component.name },
                    { isActive: false }
                );
            } catch (err) {
                console.error("Failed to deactivate page components:", err);
            }
        }

        res.json({ component });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update component" });
    }
};