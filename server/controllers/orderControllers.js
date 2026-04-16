import asyncHandler from "express-async-handler";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import cloudinary from "../config/cloudinary.js";
import Notification from "../models/notificationModel.js";

const createOrderNotification = async ({
    userId,
    orderId,
    type,
    title,
    message,
}) => {
    await Notification.create({
        userId,
        orderId,
        type,
        title,
        message,
    });
};


// @desc Get all orders (Admin) or user's orders
// @route GET /api/orders
// @access Private

export const getOrders = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 20;
    const sortOrder = req.query.sortOrder || "desc";

    // Validate page & perPage
    if (page < 1 || perPage < 1) {
        res.status(400);
        throw new Error("Page and perPage must be positive integers");
    }

    // Validate sortOrder
    if (!["asc", "desc"].includes(sortOrder)) {
        res.status(400);
        throw new Error('Sort order must be "asc" or "desc"');
    }

    const skip = (page - 1) * perPage;
    const sortValue = sortOrder === "asc" ? 1 : -1;

    // Nếu là admin → lấy tất cả orders
    // Nếu không → chỉ lấy order của chính user
    const filter = req.user.role === "admin"
        ? {}
        : { userId: req.user._id };


    const total = await Order.countDocuments(filter);

    const orders = await Order.find(filter)
        .populate("userId", "name email")
        .skip(skip)
        .limit(perPage)
        .sort({ createdAt: sortValue });

    const totalPages = Math.ceil(total / perPage);

    res.json({
        success: true,
        orders,
        total,
        page,
        perPage,
        totalPages,
    });
});

// @desc Update order status 
// @route PUT/api/order/:id/status
// @access Private 
export const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        res.status(404);
        throw new Error("Order not found");
    }

    if (
        req.user.role !== "admin" &&
        order.userId.toString() !== req.user._id.toString()
    ) {
        res.status(403);
        throw new Error("Not authorized");
    }

    res.json(order);

});

// @desc Create order from cart
// @route POST /api/orders
// @access Private 
export const createOrderFromCart = asyncHandler(async (req, res) => {
    const { items, shippingAddress, paymentMethod = "card" } = req.body;

    //Validate that items are provided 
    if (!items || !Array.isArray(items) || items.length === 0) {
        res.status(400);
        throw new Error("Cart items are required")
    }

    //Validate shipping address
    if (
        !shippingAddress ||
        !shippingAddress.street ||
        !shippingAddress.city ||
        !shippingAddress.country ||
        !shippingAddress.postalCode
    ) {
        res.status(400);
        throw new Error("Shipping address is requied with all fields (street, city, country, postalCode");
    }

    //validate each item structure 
    const validItems = items.map((item) => {
        if (!item._id || !item.name || !item.price || !item.quantity) {
            res.status(400);
            throw new Error("Invalid item structure");
        }
        return {
            productId: item._id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
        };
    });

    // Check stock availability and decrease stock
    for (const item of validItems) {
        const product = await Product.findById(item.productId);
        if (!product) {
            res.status(404);
            throw new Error(`Product not found: ${item.name}`);
        }
        if (product.stock < item.quantity) {
            res.status(400);
            throw new Error(`Insufficient stock for product: ${item.name}`);
        }
    }

    // Calculate total 
    const total = validItems.reduce((acc, item) => {
        return acc + item.price * item.quantity;
    }, 0);

    // Create order with "pending" status (will be updated to "paid" after successful payment)
    // For COD, keep pending so admin can mark paid later
    const order = await Order.create({
        userId: req.user._id,
        items: validItems,
        total,
        status: "pending",
        paymentMethod,
        shippingAddress,
    });

    // Decrease stock after order creation
    for (const item of validItems) {
        await Product.findByIdAndUpdate(item.productId, {
            $inc: { stock: -item.quantity }
        });
    }

    await createOrderNotification({
        userId: req.user._id,
        orderId: order._id,
        type: "order_placed",
        title: "Order placed successfully",
        message: `Your order #${order._id.toString().slice(-8).toUpperCase()} has been placed.`,
    });

    res.status(201).json({
        success: true,
        order,
        message: "Order created successfully",
    });
});

// @desc Get all orders for admin 
// @route GET /api/orders/admin 
// @access Private/Admin 
export const getAllOrdersAdmin = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;
    const sortOrder = req.query.sortOrder === "desc" ? -1 : 1;
    const status = req.query.status;
    const paymentStatus = req.query.paymentStatus;

    // Build filter object
    const filter = {};
    if (status && status !== "all") {
        filter.status = status;
    }
    if (paymentStatus && paymentStatus !== "all") {
        // Map payment status to actual status values 
        if (paymentStatus === "paid") {
            filter.status = { $in: ["paid", "completed"] };
        } else if (paymentStatus === "pending") {
            filter.status = "pending";
        } else if (paymentStatus === "failed") {
            filter.status = "cancelled";
        }
    }

    const skip = (page - 1) * perPage;

    const orders = await Order.find(filter)
        .populate("userId", "name email")
        .populate("items.productId", "name price image")
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(perPage);

    const total = await Order.countDocuments(filter);
    const totalPages = Math.ceil(total / perPage);

    // Transform data to match frontend expectations
    const transformedOrders = orders.map((order) => ({
        _id: order._id,
        orderId: `ORD-${order._id.toString().slice(-6).toUpperCase()}`,
        user: {
            _id: order.userId._id,
            name: order.userId.name,
            email: order.userId.email,
        },
        items: order.items.map((item) => ({
            products: {
                _id: item.productId._id,
                name: item.productId.name,
                price: item.productId.price,
                image: item.productId.image,
            },
            quantity: item.quantity,
            price: item.price,
        })),
        totalAmount: order.total,
        status: order.status,
        paymentStatus:
            order.status === "paid" || order.status === "completed"
                ? "paid"
                : order.status === "cancelled"
                    ? "failed"
                    : "pending",

        shippingAddress: order.shippingAddress || {
            street: "N/A",
            city: "N/A",
            state: "N/A",
            zipCode: "N/A",
            country: "N/A",
        },
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
    }));
    res.json({
        orders: transformedOrders,
        total,
        totalPages,
        currentPage: page,
    });

});

// @desc Delete order 
// @route DELETE/api/order/:id
export const deleteOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        res.status(404);
        throw new Error("Order not found");
    }

    // check if user owns this order or is an admin 
    if (
        req.user.role !== "admin"
        // && order.userId.toString() !== req.user._id.toString()

    ) {
        res.status(403);
        throw new Error("Not authorized to delete this order");
    }

    // Nếu đơn hàng chưa bị hủy, cần hoàn lại kho trước khi xóa hoàn toàn
    if (order.status !== "cancelled") {
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { stock: item.quantity }
            });
        }
    }

    await Order.findByIdAndDelete(req.params.id);

    res.json({
        success: true,
        message: "Order deleted successfully",
    });
});

// @desc Update order status 
// @route PUT/api/order/:id/status
// @access Private 

export const updateOrderStatus = asyncHandler(async (req, res) => {
    if (!req.body) {
        return res.status(400).json({
            success: false,
            message: "Request body is missing",
        });
    }

    const { status, paymentIntentId, stripeSessionId } = req.body;

    // Validate status 
    const validStatuses = ["pending", "paid", "completed", "cancelled"];
    if (!status || !validStatuses.includes(status)) {
        res.status(400);
        throw new Error(
            "Invalid status. Must be one of: pending, paid, completed, cancelled"
        );
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
        res.status(404);
        throw new Error("Order not found");
    }

    // Check authorization based on order status and user role
    // - User can update their own orders to "paid" or "cancelled" if status is "pending"
    // - Admins can update any order at any time
    // - Webhook calls (no req.user) are always allowed
    if (req.user) {
        const isOwner = order.userId.toString() === req.user._id.toString();
        const isAdmin = req.user.role === "admin";

        // Allow if admin or (owner and updating to paid/cancelled from pending)
        const isAllowedUserAction = isOwner && (status === "paid" || status === "cancelled") && order.status === "pending";

        if (!isAdmin && !isAllowedUserAction) {
            res.status(403);
            throw new Error("Not authorized to update this order");
        }
    }

    // Prepare update object 
    const updateData = {
        status,
        updatedAt: new Date(),
    };

    // If marking as paid, store payment information and timestamp 
    if (status === "paid") {
        if (paymentIntentId) {
            updateData.paymentIntentId = paymentIntentId;
        }
        if (stripeSessionId) {
            updateData.stripeSessionId = stripeSessionId;
        }
        updateData.paidAt = new Date();
    }

    // If status is being changed to cancelled, restore stock
    if (status === "cancelled" && order.status !== "cancelled") {
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { stock: item.quantity }
            });
        }
    }

    const previousStatus = order.status;

    // Use findByIdAndUpdate to avoid full document validation 
    const updatedOrder = await Order.findByIdAndUpdate(
        req.params.id,
        updateData,
        {
            new: true,
            runValidators: false, // Disable validation to avoid shipping address issues 
        }
    );

    if (updatedOrder && previousStatus !== status) {
        await createOrderNotification({
            userId: order.userId,
            orderId: order._id,
            type: "order_status_changed",
            title: "Order status updated",
            message: `Your order #${order._id.toString().slice(-8).toUpperCase()} changed from ${previousStatus} to ${status}.`,
        });
    }

    res.json({
        success: true,
        order: updatedOrder,
        message: `Order status updated to ${status}`,
    });
});
