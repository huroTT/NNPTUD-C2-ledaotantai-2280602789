const Product = require('../models/product.model');
const slugify = require('slugify');

class ProductController {
  // Get all products with filtering (from buoi6)
  async getAllProducts(req, res) {
    try {
      const queries = req.query;
      const titleQ = queries.title ? queries.title : '';
      const maxPrice = queries.maxPrice ? parseFloat(queries.maxPrice) : 1E4;
      const minPrice = queries.minPrice ? parseFloat(queries.minPrice) : 0;
      const limit = queries.limit ? parseInt(queries.limit) : 5;
      const page = queries.page ? parseInt(queries.page) : 1;

      let products = await Product.find({ isDeleted: false });
      
      // Filter products
      const filteredProducts = products.filter(product => {
        return product.price >= minPrice &&
               product.price <= maxPrice &&
               product.title.toLowerCase().includes(titleQ.toLowerCase());
      });

      // Pagination
      const startIndex = limit * (page - 1);
      const result = filteredProducts.slice(startIndex, startIndex + limit);
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Get product by ID (from buoi6)
  async getProductById(req, res) {
    try {
      const product = await Product.findOne({
        _id: req.params.id,
        isDeleted: false
      });
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(404).json({ message: "Product not found" });
    }
  }

  // Create product (from buoi6)
  async createProduct(req, res) {
    try {
      const product = new Product({
        title: req.body.title,
        slug: slugify(req.body.title, {
          replacement: '-',
          remove: undefined,
          locale: 'vi',
          trim: true
        }),
        price: req.body.price,
        description: req.body.description,
        category: req.body.category,
        images: req.body.images
      });
      
      await product.save();
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Update product (from buoi6)
  async updateProduct(req, res) {
    try {
      const product = await Product.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      
      if (!product || product.isDeleted) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Soft delete product (from buoi6)
  async deleteProduct(req, res) {
    try {
      const product = await Product.findByIdAndUpdate(
        req.params.id,
        { isDeleted: true },
        { new: true }
      );
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json({ message: 'Product deleted successfully' });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

module.exports = new ProductController();