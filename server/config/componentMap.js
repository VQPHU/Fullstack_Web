import Banner from "../models/bannerModel.js";
import Product from "../models/productModel.js";
import Brand from "../models/brandModel.js";
import productType from "../models/productTypeModel.js";
import AdsBanner from "../models/adsBannerModel.js";
import Category from "../models/categoryModel.js";

export const COMPONENT_MAP = {
  home_banner: async () => await Banner.find(),
  best_deals: async () => await Product.find(),
  home_brands: async () => await Brand.find(),
  home_product_types: async () => await productType.find(),
  ads_banner: async () => await AdsBanner.find(),
  categories: async () => await Category.find(),
};