import PageComponent from "../models/pageComponentModel.js";
import { COMPONENT_MAP } from "../config/componentMap.js";

// ─── PUBLIC ────────────────────────────────────────────────────────────────────

/**
 * GET /api/page-components/public/:pageType
 * Lấy data thực tế của các component active theo pageType (dành cho frontend)
 */
export const getPageComponents = async (req, res) => {
    try {
        const { pageType } = req.params;

        const components = await PageComponent.find({
            pageType,
            isActive: true,
        }).sort({ displayOrder: 1 });

        const result = await Promise.all(
            components.map(async (comp) => {
                const handler = COMPONENT_MAP[comp.componentType];

                if (!handler) {
                    return {
                        componentType: comp.componentType,
                        title: comp.title,
                        data: [],
                    };
                }

                const data = await handler(comp.config);

                return {
                    componentType: comp.componentType,
                    title: comp.title,
                    data,
                };
            })
        );

        res.json({ components: result });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch page components" });
    }
};

// ─── ADMIN ─────────────────────────────────────────────────────────────────────

/**
 * GET /api/page-components?pageType=home
 * Lấy danh sách tất cả component (admin), filter theo pageType nếu có
 */
export const getAllPageComponents = async (req, res) => {
    try {
        const { pageType } = req.query;

        const filter = {};
        if (pageType) filter.pageType = pageType;

        const components = await PageComponent.find(filter)
            .sort({ pageType: 1, displayOrder: 1 })
            .populate("createdBy", "name email")
            .populate("updatedBy", "name email");

        res.json({ components });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch page components" });
    }
};

/**
 * GET /api/page-components/:id
 * Lấy chi tiết 1 component
 */
export const getPageComponentById = async (req, res) => {
    try {
        const component = await PageComponent.findById(req.params.id)
            .populate("createdBy", "name email")
            .populate("updatedBy", "name email");

        if (!component) {
            return res.status(404).json({ error: "Component not found" });
        }

        res.json({ component });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch component" });
    }
};

/**
 * POST /api/page-components
 * Tạo mới component
 */
export const createPageComponent = async (req, res) => {
    try {
        const {
            pageType,
            componentType,
            title,
            description,
            displayOrder,
            isActive,
            config,
        } = req.body;

        const component = await PageComponent.create({
            pageType,
            componentType,
            title,
            description,
            displayOrder,
            isActive,
            config,
            createdBy: req.user._id,
            updatedBy: req.user._id,
        });

        res.status(201).json({ component });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create component" });
    }
};

/**
 * PUT /api/page-components/:id
 * Cập nhật component
 */
export const updatePageComponent = async (req, res) => {
    try {
        const {
            pageType,
            componentType,
            title,
            description,
            displayOrder,
            isActive,
            config,
        } = req.body;

        const component = await PageComponent.findByIdAndUpdate(
            req.params.id,
            {
                pageType,
                componentType,
                title,
                description,
                displayOrder,
                isActive,
                config,
                updatedBy: req.user._id,
            },
            { new: true, runValidators: true }
        );

        if (!component) {
            return res.status(404).json({ error: "Component not found" });
        }

        res.json({ component });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update component" });
    }
};

/**
 * DELETE /api/page-components/:id
 * Xóa component
 */
export const deletePageComponent = async (req, res) => {
    try {
        const component = await PageComponent.findByIdAndDelete(req.params.id);

        if (!component) {
            return res.status(404).json({ error: "Component not found" });
        }

        res.json({ message: "Component deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete component" });
    }
};

/**
 * PATCH /api/page-components/reorder
 * Cập nhật thứ tự drag & drop
 * Body: { items: [{ id, displayOrder }] }
 */
export const reorderPageComponents = async (req, res) => {
    try {
        const { items } = req.body;

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: "items is required" });
        }

        const bulkOps = items.map(({ id, displayOrder }) => ({
            updateOne: {
                filter: { _id: id },
                update: { displayOrder, updatedBy: req.user._id },
            },
        }));

        await PageComponent.bulkWrite(bulkOps);

        res.json({ message: "Reordered successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to reorder components" });
    }
};

/**
 * GET /api/page-components/component-types
 * Lấy danh sách component types từ COMPONENT_MAP (dùng cho dropdown)
 */
export const getComponentTypes = async (req, res) => {
    try {
        const types = Object.keys(COMPONENT_MAP).map((key) => ({
            value: key,
            label: key
                .replace(/_/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase()),
        }));

        res.json({ types });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch component types" });
    }
};